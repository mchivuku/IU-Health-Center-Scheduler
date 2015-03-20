<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:30 AM
 */

namespace Scheduler\Repository;

require_once 'BaseRepository.php';


class AppointmentRepository extends BaseRepository
{
    protected $table = 'enc';
    protected $active_appointment_statuses = array('Pending', 'Arrived', 'Checked', 'Rescheduled');

    public   function valid_appt_status_query()
    {
        $where_clause = "";
        foreach ($this->active_appointment_statuses as $val) {
            if (empty($where_clause)) {
                $where_clause[] = "lower(description)  LIKE '" . strtolower($val) . "%'";
            } else {
                $where_clause[] = " or lower(description)  LIKE '" . strtolower($val) . "%'";
            }

        }

        $string = implode('  ', $where_clause);
        return 'enc.STATUS IN (select Code from ecw_visitstatus where ' . $string . ')';
    }

    /***
     *
     * Function is used to retrieve all the previous appointments for the user given universityId.
     * Only show appointments that are valid - arrived, pending,checkedout
     * @param $universityId
     *
     */
    public function getAllPreviousAppointments($universityId)
    {

        $string = $this->valid_appt_status_query();
        $appointment_list = \DB::table($this->table)
            ->join('patients', 'enc.patientID', '=', 'patients.pid')
            ->leftJoin('users as resource', 'enc.resourceID', '=', 'resource.uid')
            ->leftJoin('iu_scheduler_facility_charttitle', 'enc.facilityId', '=', 'iu_scheduler_facility_charttitle.FacilityId')
            ->leftJoin('visitcodes', 'enc.visitType', '=', 'visitcodes.Name')
            ->where('patients.controlNo', '=', $universityId)
            ->whereRaw(\DB::RAW($string))
            ->select(array('encounterID as encId', 'patientId', 'visitcodes.Description as visitType', 'reason',
                'startTime',
                'endTime', 'enc.date as date', 'iu_scheduler_facility_charttitle.Description as facility',
                'iu_scheduler_facility_charttitle.FacilityId as facilityId',
                'resource.ufname as providerFirstName',
                'resource.ulname as providerLastName', 'visitcodes.CodeId as visitTypeId'
            ))
            ->orderBy('date', 'desc')
            ->orderBy('startTime', 'desc')
            ->get();


        $result = array();
        foreach ($appointment_list as $appointment) {
            $appt = new \Appointment();
            $appt->displayFormat = true;
            foreach ($appointment as $k => $v) {
                $appt->{$k} = $v;
            }
            $result[] = $appt;
        }


        return $result;

    }

    /**
     *
     * @param $universityId
     * @return appointment
     */
    public function getNextAppointment($universityId)
    {

        $next_appointment = \DB::table($this->table)
            ->join('patients', 'enc.patientID', '=', 'patients.pid')
            ->leftJoin('users as resource', 'enc.resourceID', '=', 'resource.uid')
            ->leftJoin('edi_facilities', 'enc.facilityId', '=', 'edi_facilities.id')
            ->where('patients.controlNo', '=', $universityId)
            ->where('enc.Date', '>=', 'CURDATE()')
            ->select(array('encounterID as encId', 'patientId', 'visitType', 'reason', 'startTime',
                'endTime', 'enc.date', 'edi_facilities.name as facility', 'resource.ufname as providerFirstName',
                'resource.ulname as providerLastName'
            ))->orderBy('enc.date')
            ->take(1)->first();

        if (isset($next_appointment)) {
            $appt = new \Appointment();
            $appt->displayFormat = true;
            foreach ($next_appointment as $k => $v) {
                $appt->{$k} = $v;
            }
            return $appt;
        }

        return null;

    }

    /***
     * Function to retrieve available appointment times for a given provider, visittype, facility.
     * @param $providerId
     * @param $startTime
     * @param $endTime
     * @param $visitTypeId
     * @param $sessionId - as user interactions are saved to the database.
     * @param $date
     */
    public function getAllAppointmentTimes($facilityId,$visitType, $providerId, $startTime, $endTime, $date)
    {

        $provider_repo = new ProviderRepository();
        $provider_work_hours = $provider_repo->getProviderWorkHours($providerId,$facilityId,$visitType,$date);


        // 1. Appointment query
        $all_appt_times_query = \DB::table('enc')
            ->where("resourceId", "=", $providerId)
            ->where('date', '=', $date)
            ->where('deleteFlag', '=', 0)
            ->whereRaw(\DB::RAW($this->valid_appt_status_query()))->select(array('startTime',
                'endTime'));

        // 2. Blocks query
        $blocks_query = \DB::table('ApptBlocks')
            ->join('ApptBlockDetails', 'ApptBlocks.Id', '=', 'ApptBlockDetails.Id')
            ->where('userId', '=', $providerId)->where('StartDate', '=', $date)
            ->select(array('StartTime as startTime',
                'EndTime as endTime'));

        //3. Log query
        $scheduler_log_query = \DB::table('iu_scheduler_log')
            ->where('providerId', '=', $providerId)->where('encDate', '=', $date)
            ->where('visitType', '=', $visitType)
            ->select(array('startTime',
                'endTime'));

        $unavailable = $all_appt_times_query->unionAll($blocks_query)->unionAll($scheduler_log_query)->get();

        $merged_unavailable = $this->merge_unavailable($unavailable);

        $available_times = $this->construct_available_times($startTime, $endTime, $merged_unavailable);
        $overlapping_hours = get_overlapping_hr($startTime,$endTime,$provider_work_hours->StartTime,
            $provider_work_hours->EndTime);

        $time_slots = array();

        foreach ($available_times as $available) {
            split_range_into_slots_by_duration($available['Available_from'], $available['Available_to'],
                $provider_work_hours->minutes*60,
                $time_slots);

        }
        $start = $overlapping_hours['startTime'];
        $end = $overlapping_hours['endTime'];

        $past_times=array();
        $filter_times = array_filter($time_slots, function ($item) use ($start, $end, $date,&$past_times) {
            if ($date == date('Y-m-d')){
                $timeNow = date('H:i');
                if(($item >= $start && $item <= $end)){
                    $past_times[]= $item;
                }

                return $item >= $start && $item <= $end && $item >= $timeNow;
            }


            return $item >= $start && $item <= $end;
        });



        return  array('Id' => $providerId,
             'minutes' => $provider_work_hours->minutes,
            'startTime' => $start, 'endTime' => $end,
            'times' => $filter_times,'past_times'=>$past_times);



    }


    public function createAppointment($controlNo, $sessionId, \Appointment $appointment)
    {
        $scheduler = new \ScheduleTimes();
        global $LANG;

        try {

            // 1. check if the appointment slot still exists.
            $pdo = \DB::connection('mysql')->getPdo();
            $pdo->beginTransaction();
            $pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);

            $endTime = $scheduler->getEndOfTheDay();
            $startTime = $scheduler->getBeginOfTheDay();


            $available_sql =

                sprintf("SELECT  count(*)     as total
                            from
                                 (select startTime, endTime
                                                        from enc
                                                        where enc.date = :encDate and deleteFlag=0 and
                                                        enc.resourceId= :providerId and  %s

                                                        UNION all
                                                        select StartTime as startTime,
                                                        EndTime as endTime
                                                        from ApptBlocks block join ApptBlockDetails details
                                                        on block.Id = details.Id
                                                        where userId=:providerId and StartDate=:encDate
                                                        UNION ALL
                                                        select  startTime,
                                                         endTime
                                                        from iu_scheduler_log
                                                        where providerId=:providerId and encDate=:encDate AND
                                                        visitType =:visitType  and
                                                        sessionId!=:sessionId)x
                            where TIMediff(startTime,:apptStartTime)<=0 and timediff(:apptEndTime,endTime)<=0
                                           ", $this->valid_appt_status_query());

            $statement = $pdo->prepare($available_sql);
            $providerId = $appointment->providerId;
            $date = ($appointment->date);
            $visitType = $appointment->visitType;
            $apptBeginTime = $appointment->startTime;
            $apptEndTime = $appointment->endTime;

            $statement->bindParam(':providerId', $providerId, \PDO::PARAM_STR, 256);
            $statement->bindParam(":startTime", $startTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":endTime", $endTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":encDate", $date, \PDO::PARAM_STR, 256);
            $statement->bindParam(":visitType", $visitType, \PDO::PARAM_STR, 256);
            $statement->bindParam(":apptStartTime", $apptBeginTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":apptEndTime", $apptEndTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":sessionId", $sessionId, \PDO::PARAM_STR, 256);

            $nRow = 0;
            if ($statement->execute()):
                while ($row = $statement->fetch(\PDO::FETCH_ASSOC)) {
                    $nRow = $row['total'];
                }
            endif;

            if ($nRow == 0) {
                $insert_variables = array('patientID', 'date', 'startTime', 'endTime', 'VisitType', 'visittypeid',
                    'STATUS',
                    'vmid', 'ResourceId', 'facilityId', 'doctorID', 'generalNotes', 'POS', 'visitstscodeId',
                    'VisitCopay', 'ClaimReq', 'CopayChanged');

                // 2. create appointment otherwise return;
                $insert_sql = "INSERT INTO enc(" . implode(", ", $insert_variables) . ")
                select (select pid from patients where controlNo=:controlNo)patientID,
                :encDate as date,:startTime as startTime, :endTime as endTime,
                (select Name from visitcodes  where CodeId=:visitType) as VisitType  ,
                (select CodeId from visitcodes  where CodeId=:visitType) as visittypeid,
                :status as STATUS, :vmid,
                :resourceId as ResourceId,
                     primaryservicelocation   as facilityId, (case when userType=1 then uid else
                     DefApptProvForResource end) as doctorID, :generalNotes , :pos,
                     (select CodeId from visitstscodes where code=:status) as visitstscodeId,0.0,1,0
                   from
                    Users where uid=:resourceId
                 ";

                $vmid = $this->uniqueId();
                $status = APPT_PENDING;
                $generalNotes = $LANG['generalNotes'];
                $pos = DEFAULT_POS_VALUE;

                $apptstartTime = date('H:i:s', strtotime($apptBeginTime));
                $apptendTime = date('H:i:s', strtotime($apptEndTime));

                $insert_statement = $pdo->prepare($insert_sql);
                $insert_statement->bindParam(':controlNo', $controlNo, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":encDate", $date, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":startTime", $apptstartTime, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":endTime", $apptendTime, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":visitType", $visitType, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":status", $status, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":vmid", $vmid, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":resourceId", $providerId, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":generalNotes", $generalNotes, \PDO::PARAM_STR, 256);
                $insert_statement->bindParam(":pos", $pos, \PDO::PARAM_INT);


                $insert_statement->execute();
                $encId = $pdo->lastInsertId();

                // step b - insert into encounterdata table., annual notes table, appntconfemaillogs

                $insert_into_encounterdata_table_sql = "INSERT INTO encounterdata (encounterID) values (:encId)
                ";

                $insert_encounter_data_table_statement = $pdo->prepare($insert_into_encounterdata_table_sql);
                $insert_encounter_data_table_statement->bindParam(':encId', $encId, \PDO::PARAM_STR, 256);
                $insert_encounter_data_table_statement->execute();


                // step2 -  INSERT INTO annualnotes SET encounterID=632843, notes='', type='Billing'·

                $annual_notes_sql = "INSERT INTO annualnotes (encounterID, notes, type) values(:encounterId,'',
                'Billing')";
                $annual_notes_statement = $pdo->prepare($annual_notes_sql);
                $annual_notes_statement->bindParam(':encounterId', $encId, \PDO::PARAM_INT);
                $annual_notes_statement->execute();

                //step3 - insert into log set encounterId=632912, userId=317150, date='2015-03-12', time='13:53:50', actionFlag=1
                $log_sql = "
INSERT INTO log (encounterID, userId, date,time,actionFlag)
                    (select :encounterId, pid  as userId,:encDate as date,
                    :startTime as time, 1 as actionFlag from patients
where controlNo=:controlNo)
                ";

                $log_statement = $pdo->prepare($log_sql);
                $log_statement->bindParam(':encounterId', $encId, \PDO::PARAM_INT);
                $log_statement->bindParam(':controlNo', $controlNo, \PDO::PARAM_STR, 256);
                $log_statement->bindParam(':encDate', $date, \PDO::PARAM_STR, 256);
                $log_statement->bindParam(":startTime", $apptstartTime, \PDO::PARAM_STR, 256);
                $log_statement->bindParam(':controlNo', $controlNo, \PDO::PARAM_STR, 256);

                $log_statement->execute();

                // 3. set the session Id - slots as InActive or delete - as the appointment has been made
                $delete_query = "delete from iu_scheduler_log  where sessionId=:sessionId";

                $update_query_statement = $pdo->prepare($delete_query);

                $update_query_statement->bindParam(":sessionId", $sessionId, \PDO::PARAM_STR, 256);
                $update_query_statement->execute();

                $pdo->commit();

                return $encId;

            }

            return false;


        } catch (\Exception $ex) {
            throw $ex;
            exit;

            //rollback
        }
    }

    function  uniqueId()
    {
        return rand(1, 1000003033);
    }

    /**
     * Cancel Appointment
     * @param $encId
     */
    function cancelAppointment($encId)
    {
        \DB::table('enc')
            ->where('encounterID', '=', $encId)
            ->update(array('STATUS' => APPT_CANCELLED_STATUS));
        return;
    }


    /**
     * Function to get available dates for the appointment
     *
     *
     * */
    function getAvailableDates($month, $year, $providerId, $visitType, $sessionId, $startTime, $endTime, $duration)
    {


        $enc_query = \DB::table('enc')
            ->where("resourceId", "=", $providerId)
            ->whereRaw("month(date) = $month")
            ->whereRaw(\DB::RAW($this->valid_appt_status_query()))
            ->whereRaw("year(enc.date)= $year")->where('deleteFlag', '=', 0)
            ->select(\DB::raw('timestamp(date,startTime) as startTime, timestamp(date,endTime) as endTime'));


        // 2. Blocks query
        $blocks_query = \DB::table('ApptBlocks')
            ->join('ApptBlockDetails', 'ApptBlocks.Id', '=', 'ApptBlockDetails.Id')
            ->where('userId', '=', $providerId)
            ->whereRaw('month(StartDate)=' . $month)
            ->whereRaw('year(StartDate)= ' . $year)
            ->select(\DB::raw('timestamp(StartDate,StartTime) as startTime, timestamp(StartDate,EndTime) as endTime'));

        //3. Log query
        $scheduler_log_query = \DB::table('iu_scheduler_log')
            ->where('providerId', '=', $providerId)
            ->whereRaw('month(encDate) =' . $month)
            ->whereRaw('year(encDate)=' . $year)
            ->where('visitType', '=', $visitType)
            ->where('sessionId', '!=', $sessionId)
            ->select(\DB::raw('timestamp(encDate,startTime) as startTime, timestamp(encDate,endTime) as endTime'));


        $unavailable = $enc_query->unionAll($blocks_query)->unionAll($scheduler_log_query)->get();

        $merged_unavailable = $this->merge_unavailable($unavailable);


        $group_times_by_days = function ($merged_unavailable) {
            if (count($merged_unavailable) == 0) return array();
            $temp = array();
            foreach ($merged_unavailable as $value) {
                $date = strtotime($value['startTime']);
                $current = date('Y-m-d', $date);

                if (!isset($temp[$current])) {
                    $temp[$current] = array();
                }
                array_push($temp[$current], $value);
            }

            return $temp;
        };


        $available = array();
        $x = $group_times_by_days($merged_unavailable);


        foreach ($x as $k => $item) {
            $start = date('Y-m-d H:i', strtotime($k . "" . $startTime));
            $end = date('Y-m-d H:i', strtotime($k . "" . $endTime));


            $available[$k] = array_filter($this->construct_available_times($start, $end, $item),
                function ($times) {
                    return $times['Available_to'] >= $times['Available_from'];
                });;


        }


        $available_dates = array();

        $start_date = "01-" . $month . "-" . $year;
        $start_time = strtotime($start_date);

        $end_time = strtotime("+1 month", $start_time);

        for ($i = $start_time; $i < $end_time; $i += 86400) {
            $date = date('Y-m-d', $i);
            if (array_key_exists($date, $available)) {
                $is_available = false;
                foreach ($available[$date] as $times) {
                    $interval = date_diff(new \DateTime($times['Available_to']),
                        new \DateTime($times['Available_from']));
                    $minutes = $interval->days * 24 * 60;
                    $minutes += $interval->h * 60;
                    $minutes += $interval->i;

                    if ($minutes >= $duration) {
                        $is_available = true;
                    }
                }
                if ($is_available == true)
                    $available_dates[] = $date;

            } else {
                $available_dates[] = $date;
            }

        }

        return ($available_dates);


    }


    public function getEmailTemplateForAppointment($encId)
    {

        $email_template_content = \DB::table('tblwebTemplates')
            ->whereExists(function ($query) use ($encId) {
                $query->select(\DB::raw(1))
                    ->from('enc')
                    ->whereRaw('lower(visitType) like lower(tblwebTemplates.Name)')
                    ->where('encounterId', '=', $encId);
            })
            ->Where('deleteFlag', '=', 0)
            ->select('content')
            ->first();

        if (empty($email_template_content)) {

            $email_template_content = \DB::table('tblwebTemplates')
                ->select('content')->where("Name", 'like',
                    DEFAULT_EMAIL_TEMPLATE)->first();

        }

        // $email = (strip_tags($email_template_content->content,'<br/><br><p><strong><DIV><div><P><STRONG><FONT>'));

        preg_replace('/(<font[^>]*>)|(<\/font>)/', '', $str);;
        $email = "<div>" . ($email_template_content->content) . "</div>";

        return $email;


    }


    /**
     * Function to retrieve appointment
     * @param $encId
     */
    public function getAppointment($encId)
    {

        $appointment = \DB::table($this->table)->where('encounterId', '=', $encId)
            ->select(array('encounterID as encId', 'patientId',
                'enc.visitType', 'reason', 'startTime',
                'endTime', 'enc.date as date'
            ))
            ->first();


        $appt = new \Appointment();
        $appt->displayFormat = true;
        foreach ($appointment as $k => $v) {
            $appt->{$k} = $v;
        }
        return $appt;

    }



    // add to logs -
    //$appntconfemaillogs_sql = "INSERT INTO appntconfemaillogs(uid,encounterId,visitStatus,date,startTime,endTime,facilityId)
    //values (:uid,:encounterId, :visitstatus,:date,:startTime,:endTime,
    //:facilityId)";//

    public function insertIntoApptCnfLog($encId)
    {

        $pdo = \DB::connection('mysql')->getPdo();
        $pdo->beginTransaction();
        $pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);

        $insert_log_query = "INSERT INTO appntconfemaillogs(uid,encounterId,visitStatus,date,startTime,endTime,facilityId)
          select patientID as uid,encounterId , status as visitStatus,date,startTime,endTime,facilityId
      from enc where encounterId=:encounterId
      ";

        $statement = $pdo->prepare($insert_log_query);
        $statement->bindParam(':encounterId', $encId, \PDO::PARAM_STR, 256);


        $statement->execute();

        return;

    }


}
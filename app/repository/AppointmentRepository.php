<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:30 AM
 */

namespace Scheduler\Repository;

require_once 'BaseRepository.php';

/**
 * Class AppointmentRepository - contains method that retrieve information about the appointment
 * @package Scheduler\Repository
 */

class AppointmentRepository extends BaseRepository
{
    /**
     * @var string $table     Should contain name of the table

     */
    protected $table = 'enc';



    /**
     * Function that returns status code for appointment statuses that scheduler.
     *
     * The function takes read data from ecw_visitstatus table filtering the statuses to @var - $active_appointment_statuses
     *
     * @return subquery
     */
    public  function valid_appt_status_query()
    {
        $string = implode(',', array_map(function($item){
            return "'".$item."'";
        },\Config::get('visitstatus.valid_appt_statuses')));
        return 'enc.STATUS IN ( ' . $string . ')';
    }

    /**
     *
     * Function is used to retrieve all the previous appointments for the user based on the universityId.
     *
     * The function returns list for the home page.
     *
     * Only show appointments that are valid - arrived, pending,checkedout
     *
     * @param $universityId - university id value of the user.
     *
     * @return - list of appointment objects.
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
            ->orderBy('startTime', 'desc')->get();


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
     * Function to create an appointment
     *
     * function to create an appointment.
     *
     * @param $controlNo - patients universityId or patientId.
     * @param $sessionId -  session Id of the user.
     * @param $appointment - appointment object that contains information about the appointment.
     *
     * @return $encId - appointment Id the value of the appointment that is made.
     *
     */
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
                                                        sessionId!=:sessionId
                                                         Union ALL
        select startTime, endTime
        from enc
        join patients on enc.patientId= patients.pid
        where enc.date = :encDate and deleteFlag=0 and
        patients.controlNo = :controlNo and %s )x
                            where
                           not (TIMediff(:apptEndTime,startTime)<=0 || TIMediff(:apptStartTime,endTime)>=0)
                                           ",
                    $this->valid_appt_status_query(),$this->valid_appt_status_query());

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
            $statement->bindParam(":controlNo", $controlNo, \PDO::PARAM_STR, 256);


            $nRow = 0;
            if ($statement->execute()):
                while ($row = $statement->fetch(\PDO::FETCH_ASSOC)) {
                    $nRow = $row['total'];
                }
            endif;

            if ($nRow == 0) {
                $insert_variables = array('patientID', 'date', 'startTime', 'endTime', 'visitType', 'visittypeid',
                    'STATUS',
                    'vmid', 'ResourceId', 'facilityId', 'doctorID', 'generalNotes', 'POS', 'visitstscodeId',
                    'VisitCopay', 'ClaimReq', 'CopayChanged','reason');



                // 2. create appointment otherwise return;
                $insert_sql = "INSERT INTO enc(" . implode(", ", $insert_variables) . ")
                select (select pid from patients where controlNo=:controlNo)patientID,
                :encDate as date,:startTime as startTime, :endTime as endTime,
                (select Name as visitType from visitcodes  where CodeId=:visitType),
                (select CodeId from visitcodes  where CodeId=:visitType) as visittypeid,
                (select CodeId from ecw_visitstatus  where description like :status) as status,:vmid,
                :resourceId as ResourceId,
                     primaryservicelocation   as facilityId, (case when userType=1 then uid else
                     DefApptProvForResource end) as doctorID, :generalNotes , :pos,
                     (select CodeId from visitstscodes where code=:status) as visitstscodeId,0.0,1,0,''
                   from
                    Users where uid=:resourceId
                 ";

                $vmid = $this->uniqueId();
                $status =  \Config::get('visitstatus.pending') . "%";
                $generalNotes = $LANG['generalNotes'];


                $pos = \Config::get('settings.default_pos_value');

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
                    (select :encounterId, pid  as userId,curDate(),
                     curTime() as time, 1 as actionFlag from patients
                  where controlNo=:controlNo)
                ";

                $log_statement = $pdo->prepare($log_sql);
                $log_statement->bindParam(':encounterId', $encId, \PDO::PARAM_INT);
                $log_statement->bindParam(':controlNo', $controlNo, \PDO::PARAM_STR, 256);
                //$log_statement->bindParam(':encDate', $date, \PDO::PARAM_STR, 256);
                //$log_statement->bindParam(":startTime", $apptstartTime, \PDO::PARAM_STR, 256);
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
            //rollback
        }
    }


    /**
     *
     * Function to create unique Id.
     *
     * Unique Id is required while creating an appointment. The value is saved to VMID column in the enc table.
     *
     * @return $uniqueId
     *
     */
    function  uniqueId()
    {
       return  substr(str_shuffle(str_repeat('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:',5)),0,
           40);
    }

    /**
     * Function that runs a query to cancel the appointment
     *
     * @param $encId
     *
     */
    function cancelAppointment($encId)
    {

        $cancelled = \Config::get('settings.cancelled_visit_status_description');

        \DB::table('enc')
            ->where('encounterID', '=', $encId)
            ->update(array('STATUS' => \DB::raw('(select Code from ecw_visitstatus where description like "'
                .$cancelled.'")'))
            );


        return;
    }





    /**
     * Function to retrieve an appointment given appointment Id
     *
     * @param $encId
     * @return appointment object - containing information about the appointment.
     */
    public function getAppointment($encId)
    {

        $appointment = \DB::table($this->table)
            ->join('patients', 'enc.patientID', '=', 'patients.pid')
            ->leftJoin('users as resource', 'enc.resourceID', '=', 'resource.uid')
            ->leftJoin('iu_scheduler_facility_charttitle', 'enc.facilityId', '=', 'iu_scheduler_facility_charttitle.FacilityId')
            ->leftJoin('visitcodes', 'enc.visitType', '=', 'visitcodes.Name')
            ->where('encounterId', '=', $encId)
            ->select(array('encounterID as encId', 'patientId', 'visitcodes.Description as visitType', 'reason',
                'startTime',
                'endTime', 'enc.date as date', 'iu_scheduler_facility_charttitle.Description as facility',
                'iu_scheduler_facility_charttitle.FacilityId as facilityId',
                'resource.ufname as providerFirstName',
                'resource.ulname as providerLastName', 'visitcodes.CodeId as visitTypeId'
            ))
            ->first();


        $appt = new \Appointment();
        $appt->displayFormat = true;
        foreach ($appointment as $k => $v) {
            $appt->{$k} = $v;
        }
        return $appt;

    }


    /**
     * Function to save a log that appointment confirmation has been sent to the user.
     *
     * @param $encId
     */

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
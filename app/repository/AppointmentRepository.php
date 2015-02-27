<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:30 AM
 */

namespace Scheduler\Repository;

class AppointmentRepository
{
    protected $table = 'enc';

    /***
     *
     * Function is used to retrieve all the previous appointments for the user given universityId
     * @param $universityId
     *
     */
    public function getAllPreviousAppointments($universityId)
    {
        $status = array(APPT_PENDING,APPT_CHECKEDOUT);

        $appointment_list = \DB::table($this->table)
            ->join('patients', 'enc.patientID', '=', 'patients.pid')
            ->leftJoin('users as resource', 'enc.resourceID', '=', 'resource.uid')
            ->leftJoin('edi_facilities', 'enc.facilityId', '=', 'edi_facilities.id')
            ->where('patients.controlNo', '=', $universityId)
            ->whereIn('enc.STATUS', $status)
            ->select(array('encounterID as encId', 'patientId', 'visitType', 'reason', 'startTime',
                'endTime', 'enc.date as date', 'edi_facilities.name as facility',
                'resource.ufname as providerFirstName',
                'resource.ulname as providerLastName'
            ))
            ->orderBy('date','desc')
            ->orderBy('startTime','desc')
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
    public function getAllAppointmentTimes($visitType, $providerId,$startTime,$endTime, $date)
    {
        //1. construct appointment blocks query for the given provider
        try {

            $pdo = \DB::connection('mysql')->getPdo();

            $pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);



            $available_sql = sprintf('SELECT Available_from, Available_to
                                from
                                (
                                SELECT
                                IF(Available_from is null,:startTime, IF(TIMEDIFF(Available_from,:startTime)<=0,
                                :startTime, Available_from)
                                ) Available_from,
                                IF( Available_to is null ,:endTime,IF(TIMEDIFF(Available_to,:endTime)<=0,
                                 Available_to,:endTime) )Available_to
                                from
                                (SELECT @lasttime_to AS available_from, startTime AS available_to, @lasttime_to := endTime
                                                          FROM

                                                        (select startTime, endTime

                                                        from (select startTime, endTime
                                                        from enc
                                                        where enc.date = :encDate and
                                                        enc.resourceId=:providerId

                                                        UNION all
                                                        select StartTime as startTime,
                                                        EndTime as endTime
                                                        from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id
                                                        where userId=:providerId and StartDate=:encDate
                                                        UNION ALL
                                                        select  startTime,
                                                         endTime
                                                        from iu_scheduler_log
                                                        where providerId=:providerId and encDate=:encDate AND
                                                        visitType = :visitType
                                                        )temp
                                                        UNION ALL SELECT :endTime, :endTime
                                                        order by startTime) e
                                                        JOIN (SELECT @lasttime_to := NULL) init) x
                                ) available
                                where
                                exists
                                (select 1 from visitcodesdetails
                                where CodeId = :visitType and
                                 TIMEDIFF(Available_to,Available_from) >= MAKETIME(0,Minutes,0)
                                ) and TIMEDIFF(Available_from,:startTime)>=0
                                and TIMEDIFF(Available_to,:endTime)<=0');


            $statement = $pdo->prepare($available_sql);
            $statement->bindParam(':providerId', $providerId, \PDO::PARAM_INT);
            $statement->bindParam(":startTime",$startTime,\PDO::PARAM_STR,256);
            $statement->bindParam(":endTime", $endTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":encDate", $date, \PDO::PARAM_STR, 256);
            $statement->bindParam(":visitType", $visitType, \PDO::PARAM_STR, 256);


            $available = array();

            if ($statement->execute()):
                while ($row = $statement->fetch(\PDO::FETCH_ASSOC)) {
                    $available[] = $row;
                }
            endif;




            return $available;


        } catch (\Exception $ex) {
             echo $ex->getMessage();

        }

    }


    public function createAppointment($controlNo,$sessionId,\Appointment $appointment)
    {
        $scheduler = new \ScheduleTimes();



        try {

           // 1. check if the appointment slot still exists.
            $pdo = \DB::connection('mysql')->getPdo();
            $pdo->beginTransaction();
            $pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);

            $endTime =$scheduler->getEndOfTheDay();
            $startTime = $scheduler->getBeginOfTheDay();


            $available_sql =  "
               SELECT  count(*)     as total
                            from
                                (
                                SELECT
                                IF(Available_from is null,:startTime, IF(TIMEDIFF(Available_from,:startTime)<=0,
                                :startTime, Available_from)
                                ) Available_from,
                                IF( Available_to is null ,:endTime,IF(TIMEDIFF(Available_to,:endTime)<=0,
                                 Available_to,:endTime) )Available_to
                                from
                                (SELECT @lasttime_to AS available_from, startTime AS available_to, @lasttime_to := endTime
                                                          FROM

                                                        (select startTime, endTime

                                                        from (select startTime, endTime
                                                        from enc
                                                        where enc.date = :encDate and
                                                        enc.resourceId=:providerId

                                                        UNION all
                                                        select StartTime as startTime,
                                                        EndTime as endTime
                                                        from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id
                                                        where userId=:providerId and StartDate=:encDate
                                                        UNION ALL
                                                        select  startTime,
                                                         endTime
                                                        from iu_scheduler_log
                                                        where providerId=:providerId and encDate=:encDate AND
                                                        visitType =:visitType  and
                                        sessionId!=:sessionId
                                                        )temp
                                                        UNION ALL SELECT  :endTime, :endTime
                                                        order by startTime) e
                                                        JOIN (SELECT @lasttime_to := NULL) init) x
                                ) available
                                where
                                exists

                                (select 1 from visitcodesdetails
                                where CodeId = :visitType and
                                 TIMEDIFF(Available_to,Available_from) >= MAKETIME(0,Minutes,0)

                                )
and TIMEDIFF(:apptStartTime,Available_from)>=0 and TIMEDIFF(Available_to,:apptEndTime)
                order by Available_from";

            $statement = $pdo->prepare($available_sql);
            $providerId = $appointment->providerId;
            $date = ($appointment->date);
            $visitType = $appointment->visitType;
            $apptBeginTime = $appointment->startTime;
            $apptEndTime = $appointment->endTime;

            $statement->bindParam(':providerId', $providerId,  \PDO::PARAM_STR,256);
            $statement->bindParam(":startTime",$startTime,\PDO::PARAM_STR,256);
            $statement->bindParam(":endTime", $endTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":encDate", $date, \PDO::PARAM_STR, 256);
            $statement->bindParam(":visitType", $visitType, \PDO::PARAM_STR, 256);
            $statement->bindParam(":apptStartTime", $apptBeginTime, \PDO::PARAM_STR, 256);
            $statement->bindParam(":apptEndTime",$apptEndTime , \PDO::PARAM_STR, 256);
            $statement->bindParam(":sessionId", $sessionId, \PDO::PARAM_STR, 256);

            $nRow = 0;
            if ($statement->execute()):
                while ($row = $statement->fetch(\PDO::FETCH_ASSOC)) {
                    $nRow = $row['total'];
                }
            endif;

           if($nRow>=1){
               $insert_variables = array('patientID','date','startTime','endTime','VisitType','STATUS',
                   'vmid','ResourceId','facilityId','doctorID');

               // 2. create appointment otherwise return;
                $insert_sql = "INSERT INTO enc(". implode(", ", $insert_variables)  .  ")
                select (select pid from patients where controlNo=:controlNo)patientID,
                :encDate as date,:startTime as startTime, :endTime as endTime,
                (select Name from visitcodes  where CodeId=:visitType) as VisitType, :status as STATUS, :vmid,
                :resourceId as ResourceId,
                        DefApptProvForResource as facilityId, primaryservicelocation as doctorID from
                    Users where uid=:resourceId
                 ";


               $vmid =$this->uniqueId();
               $status = 'PEN';
               $insert_statement = $pdo->prepare($insert_sql);
               $insert_statement->bindParam(':controlNo', $controlNo, \PDO::PARAM_STR,256);
               $insert_statement->bindParam(":encDate",$date,\PDO::PARAM_STR,256);
               $insert_statement->bindParam(":startTime", $apptBeginTime, \PDO::PARAM_STR, 256);
               $insert_statement->bindParam(":endTime", $apptEndTime, \PDO::PARAM_STR, 256);
               $insert_statement->bindParam(":visitType", $visitType, \PDO::PARAM_STR, 256);
               $insert_statement->bindParam(":status", $status, \PDO::PARAM_STR, 256);
               $insert_statement->bindParam(":vmid",$vmid , \PDO::PARAM_STR, 256);
               $insert_statement->bindParam(":resourceId", $providerId, \PDO::PARAM_STR, 256);

               $insert_statement->execute();
               $encId = $pdo->lastInsertId();

               // 3. set the session Id - slots as InActive or delete - as the appointment has been made
               $delete_query = "delete from iu_scheduler_log  where sessionId=:sessionId";

               $update_query_statement = $pdo->prepare($delete_query);

                $update_query_statement->bindParam(":sessionId", $sessionId, \PDO::PARAM_STR, 256);
               $update_query_statement->execute();

               $pdo->commit();

               return true;;

           }

            return false;



        } catch (\Exception $ex) {
             echo $ex->getMessage();
             throw $ex;
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
    function cancelAppointment($encId){
        \DB::table('enc')
            ->where('encounterID', '=',$encId)
            ->update(array('STATUS' => APPT_CANCELLED_STATUS));
        return;
    }
}
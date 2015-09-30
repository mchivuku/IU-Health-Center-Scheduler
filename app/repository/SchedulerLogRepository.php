<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 10:03 AM
 */
namespace Scheduler\Repository;

class SchedulerLogRepository
{
    protected $table = 'iu_scheduler_log';


    public function  saveSelectedTime($session_id, $controlNo,
                                      $facilityId, $visitType, $providerId, $input_date, $startTime,
                                      $endTime)
    {

        $apptRep = new AppointmentRepository();

        $pdo = \DB::connection('mysql')->getPdo();
        $pdo->beginTransaction();
        $pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);

        // check if the time can be selected;
        $check_time_sql =sprintf("SELECT  count(*)  as total
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
        patients.controlNo = :controlNo and %s
        )x
        where not (TIMediff(:apptEndTime,startTime)<=0 || TIMediff(:apptStartTime,endTime)>=0)
        ", $apptRep->valid_appt_status_query(),$apptRep->valid_appt_status_query());


        $statement = $pdo->prepare($check_time_sql);
        $providerId = $providerId;
        $date = ($input_date);
        $visitType = $visitType;
        $apptBeginTime = $startTime;
        $apptEndTime = $endTime;

        $statement->bindParam(':providerId', $providerId, \PDO::PARAM_STR, 256);
        $statement->bindParam(":startTime", $startTime, \PDO::PARAM_STR, 256);
        $statement->bindParam(":endTime", $endTime, \PDO::PARAM_STR, 256);
        $statement->bindParam(":encDate", $date, \PDO::PARAM_STR, 256);
        $statement->bindParam(":visitType", $visitType, \PDO::PARAM_STR, 256);
        $statement->bindParam(":apptStartTime", $apptBeginTime, \PDO::PARAM_STR, 256);
        $statement->bindParam(":apptEndTime", $apptEndTime, \PDO::PARAM_STR, 256);
        $statement->bindParam(":sessionId", $session_id, \PDO::PARAM_STR, 256);
        $statement->bindParam(":controlNo", $controlNo, \PDO::PARAM_STR, 256);

        $nRow = 0;
        if ($statement->execute()):
            while ($row = $statement->fetch(\PDO::FETCH_ASSOC)) {
                $nRow = $row['total'];
            }
        endif;
        if ($nRow == 0){
            $exists_query = sprintf('select exists(select 1 from %s where sessionId=\'%s\') as `exists`', $this->table,
                $session_id);

            $resultObj = $pdo->prepare($exists_query);
            $exists=0;
            if ($resultObj->execute()):
                while ($row = $resultObj->fetch(\PDO::FETCH_ASSOC)) {
                   $exists = $row['exists'];
                }
            endif;

            $insert_update_values = array('facility' => $facilityId, 'visitType' => $visitType,
                'providerId' => $providerId, 'encDate' => $input_date, 'startTime' => $startTime,
                'endTime' => $endTime, 'controlNo' => $controlNo, 'updateTimestamp' => date('Y-m-d H:i:s')
            );

            $update_insert_query = function($updateColumns){
                $columns= array_keys($updateColumns);

                $field_values = "";
                $i = 0;
                foreach ($columns as $column) {
                    $field_values .= $column . " = :" . $column;
                    if(($i<count($columns)-1))$field_values.=  ",";
                    $i++;
                }

                return $field_values;
            };


            if($exists==1){

                  $sql = "UPDATE " . $this->table .
                 " SET " . $update_insert_query($insert_update_values)
                    . "   WHERE sessionId= '" .$session_id."'";

                //$insert_update_values['sessionId'] = $session_id;


                $statement = $pdo->prepare($sql);

                $statement->execute(($insert_update_values));


            }else{
                $insert_update_values['sessionId'] = $session_id;



                $sql = "insert into  " . $this->table .
                    " set " . $update_insert_query($insert_update_values);

                $statement = $pdo->prepare($sql);
                $statement->execute($insert_update_values);


            }

            $pdo->commit();

            return true;

        }


        $pdo->commit();
        return false;




    }


    public function  getSelectedTime($session_id,
                                     $facilityId, $visitType, $providerId, $input_date)
    {

        $time = \DB::table($this->table)
            ->where('sessionId', '=', $session_id)
            ->where('facility', '=', $facilityId)
            ->where('visitType', '=', $visitType)
            ->where('providerId', '=', $providerId)
            ->where('encDate', '=', $input_date)->get();


        if (!empty($time)) {
            return date('H:i', strtotime($time[0]->startTime));

        }

        return null;

    }

    // Function call to clear session Information for a given session
    public function clearSessionData($session_id)
    {
        \DB::table($this->table)->where('sessionId', $session_id)->delete();
    }


    // Function clear all sessions -
    public function clearAllPreviousSessions()
    {
        $cleartime =\Config::get('settings.clear_old_sessions_from_log_after');

        \DB::table($this->table)->whereRaw(\DB::Raw(" time_to_sec(timediff(updateTimestamp,now()
        )) <="."-".$cleartime))->delete();


    }


}
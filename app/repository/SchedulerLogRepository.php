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


    public function  saveSelectedTime($session_id,$controlNo,
            $facilityId,$visitType,$providerId,$input_date,$startTime,
            $endTime){

        $exists_query = sprintf('select exists(select 1 from %s where sessionId=\'%s\') as `exists`', $this->table,
            $session_id);

        $resultObj = \DB::selectOne($exists_query);
        $insert_update_values = array('facility' => $facilityId, 'visitType' => $visitType,
            'providerId' => $providerId, 'encDate' => $input_date, 'startTime' => $startTime,
            'endTime' => $endTime,  'controlNo'=>$controlNo
        );
        // Update
        if ($resultObj->exists == 1) {

            \DB::table($this->table)->where('sessionId', '=', $session_id)->update(
                $insert_update_values);

        }else {

            $insert_update_values['sessionId']=$session_id;

            \DB::table($this->table)->insert(
                $insert_update_values
            );

        }

        return;
    }


    public function  getSelectedTime($session_id,
                                      $facilityId,$visitType,$providerId,$input_date){

        $time = \DB::table($this->table)
            ->where('sessionId', '=', $session_id)
            ->where('facility','=', $facilityId)
            ->where('visitType','=',$visitType)
            ->where('providerId','=',$providerId)
            ->where('encDate','=',$input_date)
            ->select(
            array('startTime'))->first();

        return isset($time->startTime)?date("H:i",strtotime($time->startTime)):null;
    }



}
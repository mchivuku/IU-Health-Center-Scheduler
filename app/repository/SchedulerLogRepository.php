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

    public function insert_log_entry($sessionId, $controlNo, $facility, $visitType)
    {

        $exists_query = sprintf('select exists(select 1 from %s where sessionId=\'%s\') as `exists`', $this->table,
            $sessionId);
        $resultObj = \DB::selectOne($exists_query);

        // Update
        if ($resultObj->exists == 1) {

            \DB::table($this->table)->update(
                array('facility' => $facility, 'visitType' => $visitType
                )
            );

        } else {
            \DB::table($this->table)->insert(
                array('sessionId' => $sessionId,
                    'controlNo' => $controlNo,
                    'facility' => $facility,
                    'visitType' => $visitType
                )
            );
        }

    }
}
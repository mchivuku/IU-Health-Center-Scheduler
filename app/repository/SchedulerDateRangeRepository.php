<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 3/31/15
 * Time: 12:41 PM
 */

namespace Scheduler\Repository;

class SchedulerDateRangeRepository extends  BaseRepository{


    public function getValidDateRange(){
        $dates = \DB::table('iu_scheduler_available_date_range')
            ->select(array('Id', 'StartDate', 'EndDate'))
          ->where('IsActive', '=', '1')
          ->first();

        return $dates;

    }


}
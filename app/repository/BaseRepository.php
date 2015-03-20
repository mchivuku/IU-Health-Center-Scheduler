<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 3/18/15
 * Time: 4:39 PM
 */

namespace Scheduler\Repository;

abstract class BaseRepository{

    protected  function merge_unavailable($times)
    {
        if (count($times) <= 0)
            return;

        // Create an empty stack of intervals
        $return = array();

        // sort the intervals based on start time
        usort($times, function ($item1, $item2) {

            if(is_array($item1) && is_array($item2)){
                $first_slot_1 = $item1['startTime'];
                $first_slot_2 = $item2['startTime'];

            }else{
                $first_slot_1 = $item1->startTime;
                $first_slot_2 = $item2->startTime;

            }

            if ($first_slot_1 == $first_slot_2) {
                return 0;
            }
            return ($first_slot_1 > $first_slot_2) ? 1 : -1;

        });

        $i = 1;

        $first = $times[0];
        if(!is_array($first)){
            $starttime = $first->startTime;
            $endTime = $first->endTime;
            for ($i = 1; $i < count($times); $i++) {
                $current = $times[$i];

                if ($current->startTime <= $endTime) {
                    $endTime = max($current->endTime, $endTime);
                }else {
                    $return[] = array('startTime' => $starttime, 'endTime' => $endTime);
                    $starttime = $current->startTime;
                    $endTime = $current->endTime;
                }
            }
        }else{
            $starttime = $first['startTime'];
            $endTime = $first['endTime'];
            for ($i = 1; $i < count($times); $i++) {
                $current = $times[$i];

                if ($current['startTime'] <= $endTime) {
                    $endTime = max($current['endTime'], $endTime);
                }else {
                    $return[] = array('startTime' => $starttime, 'endTime' => $endTime);
                    $starttime = $current['startTime'];
                    $endTime = $current['endTime'];
                }
            }
        }


        $return[] = array('startTime' => $starttime, 'endTime' => $endTime);

        return $return;
    }




    //function to get the entire schedule
    protected  function construct_available_times($startTime, $endTime, $unavailable_times)
    {

        $available = array();

        for ($i = 0; $i < count($unavailable_times); $i++) {

            if ($i == 0) {
                $start = $startTime;
                $end = $unavailable_times[$i]['startTime'];

            } else {

                $start = $unavailable_times[$i - 1]['endTime'];
                $end = $unavailable_times[$i]['startTime'];

            }

            $available[] = array('Available_from' => $start, 'Available_to' => $end);

        }

        if (count($unavailable_times) > 0) {
            //insert the last element
            $last = end($unavailable_times);
            $available[] = array('Available_from' => $last['endTime'], 'Available_to' => $endTime);

        } else {
            $available[] = array('Available_from' => $startTime, 'Available_to' => $endTime);
        }


        return array_filter($available,function($item){return $item['Available_from']<$item['Available_to'];});
    }
}
<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/4/15
 * Time: 1:35 PM
 */

function getDayOfTheWeek($date)
{

    // Day of the week starts with 0 - 6
    $dw = date('w', strtotime($date)) + 1;

    return $dw;
}


function split_range_into_slots_by_duration($starttime, $endtime, $duration, &$slots)
{

    $end_time = strtotime($endtime);

    // when time duration is exactly equal
    if(strtotime(date('H:i', strtotime($starttime) + ($duration))) === $end_time){
        {
            if(!in_array($starttime, $slots)){
                $slots[] = $starttime;
            }
            return;
        }
    }


   // initialization
   if(strtotime(date('H:i', strtotime($starttime) + $duration)) < $end_time){
        $time = strtotime($starttime);
    }else{
        $time = strtotime(date('H:i', strtotime($starttime) + $duration));
    }

    // check the start time for the slot and  end time of the slot
    while (($time < $end_time) && (($time+$duration)<=$end_time)) {

        //add date as a key in first level array
        if (!in_array(date("H:i", $time), $slots)){
                $slots[] = date("H:i", $time);
        }
        $time += $duration;
    }

}


function group_slots_by_hr($array)
{
    $temp = array();

    foreach ($array as $value) {
        $date = strtotime($value->time);

        $current = date('g', $date);

        if (!isset($temp[$current])) {
            $temp[$current] = array();
        }
        array_push($temp[$current], $value);
    }

    return $temp;
}


function get_overlapping_hr($provider_start_time, $provider_end_time, $scheduleTimeID)
{
    $convert_time = function($item){
        return date('H:i',strtotime($item));
    };

    $schedule = new ScheduleTimes();
    $schedule_start_time = $schedule->getStartTimeForDay($scheduleTimeID);
    $schedule_end_time = $schedule->getEndTimeForDay($scheduleTimeID);

    if($scheduleTimeID==ScheduleTimes::DAY){
        return array('startTime'=>$convert_time($provider_start_time),'endTime'=>$convert_time($schedule_end_time));
    }

    return array('startTime'=>$convert_time($schedule_start_time),'endTime'=>$convert_time($provider_end_time));

}

function parseDateString($dateString)
{
    $time = strtotime($dateString);
    return $date = date('Y-m-d', $time);

}

function getEndTime($startTime, $duration)
{

    return date('H:i', strtotime($startTime) + $duration);

}

function convertMinToSec($duration)
{
    return $duration * 60;
}

function IsTimeInRange($time, $startTime, $endTime)
{

    $input = strtotime($time);
    $s = strtotime($startTime);
    $e = strtotime($endTime);

    return ($input >= $s && $input <= $e);


}

function getTimeDifferenceInMinutes($datetime1, $datetime2)
{
    $interval = $datetime1->diff($datetime2);
    return $interval->format("%H:%I:%S");

}



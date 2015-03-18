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
    $start_time = strtotime($starttime);
    $end_time = strtotime($endtime);

    $time = $start_time;
    while ($time < $end_time) {

        //add date as a key in first level array
        if (!array_key_exists(date("H:i", $time), $slots)) {
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


function get_overlapping_hr($starttime1, $endtime1, $starttime2, $endtime2)
{

    if (($starttime1 <= $starttime2) && ($endtime1 >= $endtime2) || (($starttime2 <= $starttime1) && ($endtime2 >= $endtime1))) {

        if (($starttime1 <= $starttime2) && ($endtime1 >= $endtime2)) {

            return array('startTime' => $starttime2,
                'endTime' => $endtime2);

        } else {
            return array('startTime' => $starttime1,
                'endTime' => $endtime1);

        }

    }

    return array('startTime' => ($starttime1 < $starttime2) ? $starttime2 : $starttime1,
        'endTime' => ($endtime1 < $endtime2) ? $endtime1 : $endtime2);

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
    echo $interval->format("%H:%I:%S");
    exit;
}
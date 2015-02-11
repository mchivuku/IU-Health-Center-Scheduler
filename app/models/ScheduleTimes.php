<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/4/15
 * Time: 4:28 PM
 */


class ScheduleTimes
{

    const DAY = 1;
    const AFTERNOON = 2;

    function getStartTimeForDay($scheduleTime)
    {
        if($scheduleTime==DAY){
            return date('H:i:s', mktime(9, 0, 0, 0, 0, 0));
        }

        return date('H:i:s', mktime(1, 0, 0, 0, 0, 0));

    }

    function getEndTimeForDay($scheduleTime)
    {
        if($scheduleTime==DAY){

            return date('H:i:s', mktime(12, 59, 0, 0, 0, 0));
        }

        return date('H:i:s', mktime(16, 59, 0, 0, 0, 0));
    }


}
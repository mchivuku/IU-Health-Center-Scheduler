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
        if ($scheduleTime == self::DAY) {
            return date('H:i', mktime(8, 0, 0, 0, 0, 0));
        }

        return date('H:i', mktime(12, 0, 0, 0, 0, 0));

    }

    function getEndTimeForDay($scheduleTime)
    {
        if ($scheduleTime == self::DAY) {

            return date('H:i', mktime(11, 59, 0, 0, 0, 0));
        }

        return date('H:i', mktime(16, 59, 0, 0, 0, 0));
    }


    function getTabsForScheduleTimes()
    {
        return array(self::DAY => 'Morning', self::AFTERNOON => "Afternoon");
    }

    function getEndOfTheDay()
    {
        return $this->getEndTimeForDay(self::AFTERNOON);
    }

    function getBeginOfTheDay()
    {
        return $this->getStartTimeForDay(self::DAY);
    }


}
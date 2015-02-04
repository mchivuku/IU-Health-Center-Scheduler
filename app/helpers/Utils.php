<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/4/15
 * Time: 1:35 PM
 */
function getDayOfTheWeek($date){

    $dw = date( "w", $date);

    return $dw;
}


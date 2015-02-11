<?php

$slots = group_times_by_hr($model->scheduler_slots);

$morning_slots = array_slice($slots, 0, 4, true);
$afternoon_slots = array_slice($slots, 4,count($slots),
   true);

function group_times_by_hr($array){
    $temp = array();

    foreach($array as $value){
        $date = strtotime($value->time);

        $current = date('g',$date);

        if(!isset($temp[$current])){
            $temp[$current] =array();
        }
        array_push($temp[$current],$value);
    }

    return $temp;
}

?>
<div class="calendar">

{{ HTML::display_times($morning_slots,array('data-prev'=>0,'data-next'=>2,'data-id'=>1,'class'=>'minutes'))}}

</div>
<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 9/29/15
 * Time: 9:37 AM
 */


return array(

    /*
    |--------------------------------------------------------------------------
    | Allow Weekends Mode
    |--------------------------------------------------------------------------
    |
    |
    |
    */

    'weekends' => false,

    'dayOfweek'=>array('Sat'=>7,'Sun'=>1),
    /*
    |--------------------------------------------------------------------------
    | Slot duration - 300 seconds - 5mins
    |--------------------------------------------------------------------------
    */

    'slot_duration' => 300,


    /*
     |--------------------------------------------------------------------------
     | Allow cancellation time - 24hrs - before
     |--------------------------------------------------------------------------
     */

    'allow_cancellation_until_time' => 24*60,


    /*
     |--------------------------------------------------------------------------
     | Clear scheduler log table - all previous sessions - 1800 seconds
     |--------------------------------------------------------------------------
     */

    'clear_old_sessions_from_log_after' => 1800,

    /*
    |--------------------------------------------------------------------------
    | show appt time now offset
    |--------------------------------------------------------------------------
    */

    'show_appt_timenow_offset' => 30,


     // For reading the visit status code for the text 'cancelled'
    'cancelled_visit_status_description'=>'cancelled',

    // save the selected time for 5 mins
    'session_activity_time' => 5,

    //value save to enc table - 11 - place of service..
    'default_pos_value' => 11

);
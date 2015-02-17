<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 10:40 AM
 */
require_once 'NewAppointmentBaseViewModel.php';

class SchedulerTabViewModel extends NewAppointmentBaseViewModel{
    public $providers;
    public $appointments;
    public $visitType;
    public $facility;

    public $scheduler_slots;

    public $tabs;
}


class AppointmentSlotViewModel{
    public $time;
    public $time_text;
    public $flag;
}


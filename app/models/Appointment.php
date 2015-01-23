<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:55 AM
 */
require_once 'Base.php';

class Appointment extends Base{

    protected $id;
    protected $patientId;

    protected $providerLastName;
    protected $providerFirstName;
    protected $providerName;

    protected $date;
    protected $startTime;
    protected $endTime;

    protected $facility;
    protected $visitType;
    protected $reason;

    public function getProviderName(){
        return $this->formatName($this->providerLastName,$this->providerFirstName);
    }

    public function getStartTime(){
        return $this->formatTime($this->startTime);
    }

    public function getEndTime(){
        return $this->formatTime($this->endTime);
    }

    public function getAppointmentDate(){
        return $this->formatDate($this->date);
    }

}
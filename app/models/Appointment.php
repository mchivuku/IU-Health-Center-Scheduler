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

    protected $appointmentDate;
    protected $apptStartTime;
    protected $apptEndTime;

    protected $facility;
    protected $visitType;
    protected $reason;

    public function getProviderName(){
        return $this->formatName($this->providerLastName,$this->providerFirstName);
    }

    public function getStartTime(){
        return $this->formatTime($this->apptStartTime);
    }

    public function getEndTime(){
        return $this->formatTime($this->apptEndTime);
    }

    public function getAppointmentDate(){
        return $this->formatDate($this->appointmentDate);
    }

}
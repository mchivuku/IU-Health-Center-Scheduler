<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:55 AM
 */
require_once 'Base.php';

class Appointment extends Base{

    protected $encId;
    protected $patientId;

    protected $providerLastName;
    protected $providerFirstName;
    protected $providerName;
    protected $providerId;

    protected $displayFormat;


    protected $date;
    protected $startTime;
    protected $endTime;

    protected $facility;
    protected $visitType;
    protected $reason;

    protected $facilityId;
    protected $visitTypeId;


    public function getProviderName(){
        return $this->formatName($this->providerLastName,$this->providerFirstName);
    }

    public function getStart(){
        if($this->displayFormat){
            return $this->formatDisplayTime($this->startTime);
        }

        return $this->formatSaveTime($this->startTime);
    }

    public function getEndTime(){
        if($this->displayFormat){
            return $this->formatDisplayTime($this->endTime);

        }
        return $this->formatSaveTime($this->endTime);

    }

    public function getAppointmentDate(){
        return $this->formatDate($this->date);
    }

}
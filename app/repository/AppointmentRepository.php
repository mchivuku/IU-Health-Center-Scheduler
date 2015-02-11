<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:30 AM
 */

namespace Scheduler\Repository;

class AppointmentRepository{


    protected $table  = 'enc';


    /***
     *
     * Function is used to retrieve all the previous appointments for the user given universityId
     * @param $universityId
     *
     */
    public function getAllPreviousAppointments($universityId){

         $appointment_list = \DB::table($this->table)
                            ->join('patients','enc.patientID', '=', 'patients.pid')
                            ->leftJoin('users as resource','enc.resourceID','=','resource.uid')
                            ->leftJoin('edi_facilities','enc.facilityId','=','edi_facilities.id')
                            ->where('patients.controlNo','=',$universityId)
                            ->select(array('encounterID as encId','patientId','visitType','reason','startTime',
                                'endTime','enc.date as date','edi_facilities.name as facility',
                                'resource.ufname as providerFirstName',
                                'resource.ulname as providerLastName'
                            ))->get();

       $result = array();
       foreach($appointment_list as $appointment){
           $appt = new \Appointment();
           foreach($appointment as $k=>$v){$appt->{$k}=$v;}
           $result[]=$appt;
       }

       return $result;

    }

    /**
     *
     * @param $universityId
     * @return appointment
     */
    public function getNextAppointment($universityId){


        $next_appointment = \DB::table($this->table)
            ->join('patients','enc.patientID', '=', 'patients.pid')
            ->leftJoin('users as resource','enc.resourceID','=','resource.uid')
            ->leftJoin('edi_facilities','enc.facilityId','=','edi_facilities.id')
            ->where('patients.controlNo','=',$universityId)
            ->where('enc.Date','>=','CURDATE()')
            ->select(array('encounterID as encId','patientId','visitType','reason','startTime',
                'endTime','enc.date','edi_facilities.name as facility','resource.ufname as providerFirstName',
                'resource.ulname as providerLastName'
            ))->orderBy('enc.date')
            ->take(1)->first();

        if(isset($next_appointment)){
            $appt = new \Appointment();
            $appt->displayFormat=true;
            foreach($next_appointment as $k=>$v){$appt->{$k}=$v;}
            return $appt;
        }

        return null;

    }

    // Get all available times for given time range - time range
    public function getAllAppointmentTimes($providerId,$date,$startTime, $endTime){
  
    }

    public function createAppointment(\Appointment $appointment){

       try{
           $insert_into_appointment = array('doctorID'=>
               $appointment->providerId,
               'patientID'=>$appointment->patientId,
               'date'=>$appointment->date,
               'startTime'=>$appointment->startTime,
               'endTime'=>$appointment->startTime,
               'visitType'=>$appointment->visitType,
               'status'=>'PEN',
               'encType'=>1,
               'vmid'=> $this->uniqueId(),
               'facilityId'=>$appointment->facility,
               'POS'=>11,'ResourceId'=> $appointment->providerId,
               'visittypeid'=> $appointment->visitType
           );
          $encId =  \DB::table($this->table)->insert(
               $insert_into_appointment);
           return $encId;


       }catch (\Exception $ex)
       {
           return false;
       }



    }

    function  uniqueId(){
        return rand(1,1000003033);
    }

}
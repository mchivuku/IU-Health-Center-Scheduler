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
    static $array_of_time=array();
    //SlOT DURATION - 5mins
    static $slot_duration = 300;



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
            foreach($next_appointment as $k=>$v){$appt->{$k}=$v;}
            return $appt;
        }

        return null;

    }

    public function getAllAvailableAppointments($providerId,$date){
        $startTime =$this->getStartTimeForDay();
        $endTime = $this->getEndTimeForDay();
        $days_slots = array();
        $this->get_split_into_slots($startTime,$endTime,$days_slots);


        //Transaction -
        try {

            $pdo = \DB::connection('mysql')->getPdo();

            $pdo->beginTransaction();

            // 1. Read all apptBlocks;
            $appt_block_sql = 'SELECT  StartTime,
                           EndTime from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id
                           where userId=:providerId and StartDate=:date ';
            $statement = $pdo->prepare($appt_block_sql);

            $statement->bindParam(':providerId', $providerId, \PDO::PARAM_INT);
            $statement->bindParam(':date',$date,\PDO::PARAM_STR,256);


            $blocks=array();
            if ($statement->execute()):
                while ($row = $statement->fetch(\PDO::FETCH_ASSOC)){
                    $blocks[]=$row;
                }
            endif;


            //2. Read appointment made;
            $enc_sql = 'SELECT  StartTime,
                           EndTime from enc
                           where doctorID=:providerId and date=:date ';

            $statement_enc = $pdo->prepare($enc_sql);

            $statement_enc->bindParam(':providerId', $providerId, \PDO::PARAM_INT);
            $statement_enc->bindParam(':date',$date,\PDO::PARAM_STR,256);

            $appts = array();
            if ($statement->execute()):
                while ($row = $statement->fetch(\PDO::FETCH_ASSOC)){
                    $appts[]=$row;
                }
            endif;

            $filled_slots = array();
            foreach($blocks as $block){
               $this->get_split_into_slots($block['StartTime'],$block['EndTime'],$filled_slots);
            }


            foreach($appts as $appt){
                 $this->get_split_into_slots($appt['StartTime'],$appt['EndTime'],$filled_slots);
            }

            return array_diff($days_slots,$filled_slots);

            $pdo->endTransaction();

        }
        catch(\PDOException $e) {
            echo $e->getMessage();
        }

    }



    function get_split_into_slots($starttime,$endtime,&$slots){
        $start_time = strtotime($starttime);
        $end_time=strtotime($endtime);
        while($start_time<=$end_time){
            //add date as a key in first level array
            if(!array_key_exists(date ("H:i:s", $start_time),  $slots)) {
                $slots[]=date ("H:i:s", $start_time);
            }

            $start_time+=self::$slot_duration;

        }


    }


    function getStartTimeForDay(){
       return date('H:i:s',mktime(9, 0, 0, 0, 0, 0));
    }

    function getEndTimeForDay(){
        return date('H:i:s',mktime(17, 0, 0, 0, 0, 0));
    }


}
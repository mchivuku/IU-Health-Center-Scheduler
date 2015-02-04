<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:30 PM
 */
namespace Scheduler\Controllers;


use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\FacilitiesRepository;
use Scheduler\Repository\PatientRepository;
use Scheduler\Repository\SchedulerLogRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\VisitTypeRepository;
use Scheduler\Repository\ProviderRepository;


require_once app_path() . "/models/viewModels/SchedulerTabViewModel.php";
require_once app_path() . "/models/viewModels/NewAppointmentViewModel.php";
require app_path() . "/helpers/Utils.php";

class NewAppointmentController extends BaseController
{

    private static $slot_duration = 300; //5 mins
    protected $providerRepo;
    protected $patientRepo;

    public function  __construct(UserRepository $userRepo,
                                 ShibbolethRepository $shibb,
                                 AppointmentRepository $apptRepo, FacilitiesRepository $facilitiesRepo,
                                 VisitTypeRepository $visitTypeRepo,
                                 SchedulerLogRepository $schedulerLogRepo, ProviderRepository $providerRepo,
                                 PatientRepository $patientRepo)
    {

        parent::__construct($userRepo, $shibb, $apptRepo, $facilitiesRepo, $visitTypeRepo, $schedulerLogRepo);
        $this->providerRepo = $providerRepo;
        $this->patientRepo=$patientRepo;
        $this->layout=  'layouts.new-appointment';

    }

    /**
     * Function to create new appointment.
     */

    public function getIndex()
    {
        $model = new \NewAppointmentViewModel();

        //TODO:read from Laravel route
        $model->selectedFacility = \Filter::filterInput(INPUT_GET, 'facility',
            FILTER_SANITIZE_SPECIAL_CHARS | FILTER_SANITIZE_ENCODED);
        $model->selectedvisitType = \Filter::filterInput(INPUT_GET, 'visitType',
            FILTER_SANITIZE_SPECIAL_CHARS | FILTER_SANITIZE_ENCODED);


        $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes();
        $model->facilities = $this->facilitiesRepo->getAllFacilities();


        return $this->view('pages.new-appointment-step1')->viewdata(array('model' => $model))->title('New Appointment');

    }

    /**
     * Schedule Function
     * @return mixed
     */
    public function schedule()
    {


        //step 1- save the values in the database
        // load the values;
        $visitType = \Filter::filterInput(INPUT_POST, 'visitType',
            FILTER_SANITIZE_SPECIAL_CHARS | FILTER_SANITIZE_ENCODED);

        $facility = \Filter::filterInput(INPUT_POST, 'facility',
            FILTER_SANITIZE_SPECIAL_CHARS | FILTER_SANITIZE_ENCODED);

        $scheduleTime = \Input::get('scheduleTime');
        if(!isset($scheduleTime)){
            $scheduleTime=\ScheduleTimes::DAY;
        }
        $model = new SchedulerTabViewModel();
        $model->tabs = array(\ScheduleTimes::DAY=>"Morning",\ScheduleTimes::NIGHT=>"Afternoon");


        return $this->view('pages.new-appointment-step1')->viewdata(array('model' => $model))->title('New Appointment');



    }

    function getAppointmentSlots($providerId, $date)
    {
        //1. Slots
        $filled_times = $this->apptRepo->getAllAppointmentTimes($providerId, $date);


        $filled_slots = array();
        $CI = $this;
        array_walk($filled_times, function ($times) use (&$filled_slots, &$CI) {
            $CI->get_split_into_slots($times['StartTime'], $times['EndTime'], $filled_slots);
        });


        //2. All days slots
        $all_days_slots = array();
        $this->get_split_into_slots($this->getStartTimeForDay(), $this->getEndTimeForDay(), $all_days_slots);

        $appts_slots = array();
        foreach ($all_days_slots as $slot) {
            $model = new \AppointmentSlotViewModel();
            $model->time = $slot;
            $model->time_text = $slot;
            if (in_array($slot, $filled_slots)) {
                $model->flag = false;
            } else {
                $model->flag = true;
            }
            $appts_slots[] = $model;

        }

        return $appts_slots;


    }

    /*** HELPER FUNCTION **/
    function get_split_into_slots($starttime, $endtime, &$slots)
    {
        $start_time = strtotime($starttime);
        $end_time = strtotime($endtime);
        while ($start_time <= $end_time) {
            //add date as a key in first level array
            if (!array_key_exists(date("H:i", $start_time), $slots)) {
                $slots[] = date("H:i", $start_time);
            }

            $start_time += self::$slot_duration;
        }

    }

    function getStartTimeForDay()
    {
        return date('H:i:s', mktime(9, 0, 0, 0, 0, 0));
    }

    function getEndTimeForDay()
    {
        return date('H:i:s', mktime(16, 59, 0, 0, 0, 0));
    }

    public function getTimes()
    {

        $providerId = \Input::get('providerId');
        $date = \Input::get('date');

        $current_date = new \DateTime($date);

        $slots = $this->getAppointmentSlots($providerId,
            $current_date->format('Y-m-d'));

        return \View::make('includes.timeslots', array('model' => $slots));

    }

    /**
     * Function to save values from the form
     */
    public function scheduleSave()
    {

        $input = \Input::all();

        $date =  (new \DateTime($input['date']));
        $appointment = new \Appointment();
        $appointment->displayFormat=false;
        $appointment->visitType = $input['visitType'];
        $appointment->facility = $input['facility'];
        $appointment->providerId = $input['provider'];
        $appointment->date =$date->format('Y-m-d');

        $times = explode(",",$input['selectedTimes']);
        // join array times into range;
        usort($times, function($a,$b){
            $atime= strtotime($a);
            $btime = strtotime($b);

            if($atime<$btime)
                return -1;
            if($atime==$btime)return 0;

            return 1;

        });

        $appointment->startTime = reset($times);
        $appointment->endTime =end($times);
        $appointment->patientId = $this->patientRepo->getPatientId($this->getUniversityId());

       $id= $this->apptRepo->createAppointment($appointment);
        echo $id;
        exit;

    }


}
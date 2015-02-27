<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:30 PM
 */
namespace Scheduler\Controllers;


use Illuminate\Support\Facades\Response;

require_once app_path() . "/models/viewModels/SchedulerTabViewModel.php";
require_once app_path() . "/models/viewModels/NewAppointmentViewModel.php";
require_once app_path() . "/models/viewModels/SchedulerConfirmViewModel.php";
require app_path() . "/helpers/Utils.php";

class NewAppointmentController extends BaseController
{
    protected $header_title = array('label'=>'IU Health Center Appointments',
        'text'=>'Schedule an appointment or get information about appointments you have already scheduled.');

    const FIRST_AVAILABLE_PROVIDER = 0;
    protected  $label = 'First Available Provider';

    public function  __construct($app)
    {
        parent::__construct($app);
        $this->layout=  'layouts.new-appointment';
    }

    private function appendFirstAvailableProviderItem(){

        return  array(array('Id'=>self::FIRST_AVAILABLE_PROVIDER,
            'Name'=>'First Available Provider'));


    }
    /**
     * Function to return index view for the new appointment
     */
    public function getIndex()
    {
        $model = new \NewAppointmentViewModel();
        $model->selectedFacility  = \Input::get('facility');
        $model->selectedvisitType = \Input::get('visitType');
        $model->facilities = $this->facilitiesRepo->getAllFacilities();
        $facility = current($model->facilities);
        $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes($facility->Id);

        return $this->view('pages.new-appointment-step1')
            ->viewdata(array('model' => $model))
            ->title('New Appointment');
    }

    /***
     * Function to return json response for visitTypes for a given facilityId
     * @return mixed
     */
    public function getVisitTypes(){
        $facilityId  = \Input::get('facilityId');

        return \Response::json((array_map(function($item){
            return  (array("id"=>$item->Id,"name"=>$item->Name));
        },$this->visitTypeRepo->getAllVisitTypes($facilityId))));
    }


    /**
     *
     * Function to return providers and schedules
     *
     */
    public function schedule(){


        $facilityId  = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $date = \Input::get('date');

        $schedule_times = new \ScheduleTimes();

        $providers = $this->providerRepo
            ->getAllProvidersWithWorkHours($facilityId,$visitType,date("Y-m-d"));

        if(empty($providers)){

            $model = array('message'=>$this->lang['noProviders']);
            return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model))->title('Schedule
                    Appointments');;
        }

        $model = new \SchedulerTabViewModel();
        $model->tabs =$schedule_times->getTabsForScheduleTimes();

        $model->providers[] = array("label" => $this->label, 'items'=>$this->appendFirstAvailableProviderItem());
        $model->providers[] =
            array('label'=>'Providers','items'=>$providers);


        if(!isset($tabId))
            $tabId = key($model->tabs);

        if(!isset($date))
            $date = date('Y-m-d');

        $default_provider = current($providers);

        $model->activeTab = $tabId;
        $model->selectedProvider = $default_provider->Id;
        $model->visitType= $visitType;
        $model->facility=$facilityId;
        $model->visitDuration= $default_provider->minutes;

        $startTime = $default_provider->StartTime;
        $endTime   = $default_provider->EndTime;

        $schedule_start_time = $schedule_times->getStartTimeForDay($tabId);
        $schedule_end_time = $schedule_times->getEndTimeForDay($tabId);


        $overlapping_times = get_overlapping_hr($schedule_start_time,$schedule_end_time,$startTime,$endTime);

        $selected_start_time = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
            $facilityId,$visitType, $default_provider->Id,$date);


        $model->selected_startTime=$selected_start_time;

        $appts_slots=$this->getTimes($default_provider->Id,$facilityId,$visitType,$default_provider->minutes,
            $overlapping_times['startTime'],$overlapping_times['endTime'],$date,$selected_start_time);

        $model->scheduler_slots =$appts_slots;

        return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model))->title('Schedule
        Appointments');

    }

    public function getAvailableTimes(){

        $schedule_times = new \ScheduleTimes();

        $facilityId  = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId =     \Input::get('tabId');
        $providerId = \Input::get('providerId');
        $input_date = \Input::get('date');

        $model = new \SchedulerTabViewModel();
        $date = parseDateString($input_date);
        $schedule_start_time = $schedule_times->getStartTimeForDay($tabId);
        $schedule_end_time = $schedule_times->getEndTimeForDay($tabId);

        $selected_start_time = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
            $facilityId,$visitType,$providerId,$date);


        if($providerId==self::FIRST_AVAILABLE_PROVIDER){

            $provider_work_hours =  $this->providerRepo->getFirstAvailableProviderWorkHours($facilityId,
                $visitType,$date,$schedule_start_time,$schedule_end_time);
            $appts_slots=$this->build_time_slots($provider_work_hours['times'],$provider_work_hours['minutes']*60,
                $provider_work_hours['startTime'],$provider_work_hours['endTime']);

            $model->firstAvailableProvider=$provider_work_hours['Id'];
        }
        else{
            $provider_work_hours = $this->providerRepo->getProviderWorkHours($providerId,$facilityId,$visitType,$date);

            $overlapping_times = get_overlapping_hr($schedule_start_time,$schedule_end_time,
                $provider_work_hours->StartTime,$provider_work_hours->EndTime);

            $appts_slots=$this->getTimes($providerId,$facilityId,$visitType,$provider_work_hours->minutes,
                $overlapping_times['startTime'],$overlapping_times['endTime'],$date,$selected_start_time);

        }

        if(empty($provider_work_hours)){

            $model = array('message'=>$this->lang['noProviders']);
            $response = Response::json($model);
            $response->header('Content-Type', 'application/json');
            return $response;
        }


        $model->scheduler_slots = $appts_slots;
        $model->tabs = array(\ScheduleTimes::DAY=>'Morning',\ScheduleTimes::AFTERNOON=>"Afternoon");
        $model->activeTab = $tabId;
        $model->selected_startTime=$selected_start_time;

        return \View::make('includes.timeslots', array('model' => $model));
    }


    function saveSelectedTime(){
        $session_id = $this->getUserSessionId();

        $facilityId  = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $providerId = \Input::get('providerId');
        $firstAvailableProvider = \Input::get('firstAvailableProvider');
        $input_date = \Input::get('date');
        $startTime = \Input::get('startTime');
        $duration = \Input::get('visitDuration');
        $endTime = getEndTime($startTime , convertMinToSec($duration));
        $date = parseDateString($input_date);

        $pId = $providerId==self::FIRST_AVAILABLE_PROVIDER?$firstAvailableProvider:$providerId;

        $this->schedulerLogRepo->saveSelectedTime($session_id,$this->getUniversityId(),
            $facilityId,$visitType,$pId,$date,$startTime,
            $endTime);

        $response = Response::json(array());
        $response->header('Content-Type', 'application/json');
        return $response;

    }

    /***
     *
     * Schedule Confirm
     */
    public function  scheduleConfirm(){

        // Get all inputs.
        $inputs = \Input::all();

        //read all post variables
        $facility  =$inputs['facility'];
        $visitType = $inputs['visitType'];
        $providerId = $inputs['provider'];
        $input_date = $inputs['date'];
        $startTime =  $inputs['startTime'];
        $duration =  $inputs['visitDuration'];
        $firstAvailableProvider = $inputs['firstAvailableProvider'];

        $endTime = getEndTime($startTime , convertMinToSec($duration));

        $date = parseDateString($input_date);

        $pId = $providerId==self::FIRST_AVAILABLE_PROVIDER?$firstAvailableProvider:$providerId;

        $model = new \SchedulerConfirmViewModel();
        $model->providerId=$pId;
        $model->providerName=$this->providerRepo->getProviderName($pId);
        $model->visitType=$visitType;
        $model->visitTypeText=$this->visitTypeRepo->getVisitTypeName($visitType);
        $model->encDate= $date;
        $model->facility=$facility;

        $model->displayDate = $date;
        $model->startTime = $startTime;
        $model->visitDuration = $duration;
        $model->endTime=$endTime;

        $model->backUrl=
            link_to_action('NewAppointmentController@schedule', 'Back',array('facility'=>$facility,
                'visitType'=>$visitType),array('class'=>'button invert back'));




        return $this->view('pages.new-appointment-step3')->viewdata(array('model' => $model))
            ->title('Schedule Confirm');


    }

    /***
     * Schedule Save - function gets called on post from the schedule page.
     */
    public function  scheduleSave(){
        // Get all inputs.
        $inputs = \Input::all();

        //read all post variables
        $visitType = $inputs['visitType'];
        $providerId = $inputs['provider'];
        $input_date = $inputs['date'];
        $startTime =  $inputs['startTime'];
        $facility =$inputs['facility'];

        $duration = $inputs['visitDuration'];
        $endTime = $inputs['endTime'];

        $date = parseDateString($input_date);



        $model = new \Appointment();
        $model->startTime = $startTime;
        $model->providerId = $providerId;
        $model->visitType = $visitType;
        $model->endTime = $endTime;
        $model->date = $date;

        $return = $this->apptRepo->createAppointment($this->getUniversityId(),$this->getUserSessionId(),
            $model);


        if($return==false){

            $model = new \SchedulerConfirmViewModel();
            $model->providerId=$providerId;
            $model->providerName=$this->providerRepo->getProviderName($providerId);
            $model->visitType=$visitType;
            $model->visitTypeText=$this->visitTypeRepo->getVisitTypeName($visitType);
            $model->encDate= $date;

            $model->displayDate = $date;
            $model->startTime = $startTime;
            $model->visitDuration = $duration;
            $model->endTime=$endTime;
            $model->facility=$facility;

            $model->errorMsg="Appointment could not be made";

            $model->backUrl=
                link_to_action('NewAppointmentController@schedule', 'Back',array('facility'=>$facility,
                    'visitType'=>$visitType),array('class'=>'button invert back'));


            return $this->view('pages.new-appointment-step3')->viewdata(array('model' => $model))
                ->title('Schedule Confirm');

        }

        return \Redirect::action('HomeController@getIndex');



    }






    /*** HELPER **/
    function getTimes($providerId,$facilityId,$visitType,$visitTypeMinutes,$startTime,$endTime,$encDate,
                      $selected_startTime=null){


        $duration = $visitTypeMinutes * 60;
        $available_times = $this->apptRepo->getAllAppointmentTimes($visitType,
            $providerId,
            $startTime,
            $endTime,$encDate);

        return $this->build_time_slots($available_times,$duration,$startTime,$endTime,$selected_startTime);



    }

    function build_time_slots($available_times,$duration,$startTime,$endTime){
        $time_slots=array();
        foreach($available_times as $available){
            split_range_into_slots_by_duration($available['Available_from'],$available['Available_to'],
                $duration,
                $time_slots);
        }

        if(isset($selected_startTime)&& IsTimeInRange($selected_startTime,$startTime,$endTime))
            $time_slots[]=$selected_startTime;

        usort($time_slots,function($startTime1,$startTime2){
            $s1 = strtotime($startTime1);
            $s2 = strtotime($startTime2);
            return $s1<$s2?-1:($s1==$s2)?0:1;
        });


        $appts_slots = array();
        foreach ($time_slots as $slot) {
            $slot_model = new \AppointmentSlotViewModel();
            $slot_model->time = $slot;
            $slot_model->time_text = $slot;
            if((isset($selected_startTime) &&  IsTimeInRange($selected_startTime,$startTime,
                        $endTime)) && $selected_startTime==$slot)
                $slot_model->flag=true;

            $appts_slots[] = $slot_model;

        }

        return $appts_slots;
    }

}

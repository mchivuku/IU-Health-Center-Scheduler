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
        'text'=>'Schedule an appointment or get information about appointments
                 you have already scheduled.');

    const FIRST_AVAILABLE_PROVIDER = 0;
    protected  $label = 'First Available Provider';


    public function  __construct($app)
    {
        parent::__construct($app);
        $this->layout=  'layouts.new-appointment';

    }

    private function appendFirstAvailableProviderItem(){

        return  array(array('Id'=>self::FIRST_AVAILABLE_PROVIDER,
            'Name'=>'First Available Provider','selected'=>true));
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

        if(isset($model->selectedFacility)){
            $facility = $model->selectedFacility;
        }
        else{
            $f = current($model->facilities);
            $facility= $f->Id;

        }


        //chart title of the facilities is linked back to visit type
        $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes($facility);

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


        $facilityId = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $date = \Input::get('date');
        $providerId = \Input::get('providerId');


        $params = array('visitType'=>$visitType,'facility'=>$facilityId);
        $queryString = http_build_query($params);
        $back_link = \URL::to(action('NewAppointmentController@getIndex') ."?".$queryString);


        $schedule_times = new \ScheduleTimes();

        if(!isset($date))
            $date = date('Y-m-d');
        if(!isset($tabId))
            $tabId=\ScheduleTimes::DAY;


        $schedule_start_time = $schedule_times->getStartTimeForDay($tabId);
        $schedule_end_time = $schedule_times->getEndTimeForDay($tabId);

        // Get All Providers
        $providers = $this->providerRepo
            ->getAllProvidersWithWorkHours($facilityId, $visitType, $date);


        //Return with a message when no providers are found
        if (empty($providers)) {

            $model = array('message' => $this->lang['noProviders']);
            return $this->view('pages.new-appointment-step2')
                ->viewdata(array('model' => $model, 'back_link' => $back_link))->title('Schedule
                        Appointments');
        }

        //If there are providers - get the first available provider
        $model = new \SchedulerTabViewModel();
        $model->tabs =$schedule_times->getTabsForScheduleTimes();
        if(!isset($tabId))
            $tabId = key($model->tabs);

        $model->activeTab = $tabId;
        $model->visitType= $visitType;
        $model->facility=$facilityId;

        // First time
        if(!isset($providerId)) {
            $first_available_provider_info= $this->providerRepo
                ->getFirstAvailableProviderWorkHours($facilityId,
                    $visitType,$date,$schedule_start_time,$schedule_end_time);


            $id = $first_available_provider_info['Id'];
            $selected_start_time = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
                $facilityId,$visitType, $id,$date);

            $model->selected_startTime=$selected_start_time;
            $model->scheduler_slots =$this->build_appt_slot_view_model($first_available_provider_info['times'],
                $selected_start_time,$first_available_provider_info['startTime'],$first_available_provider_info['endTime']);


            $model->selectedProvider=self::FIRST_AVAILABLE_PROVIDER;
            $model->firstAvailableProvider=$id;
            $model->visitDuration=$first_available_provider_info['minutes'];

            //Available for month
            $hrs = $this->providerRepo->getProviderWorkHoursForMonth($visitType,$facilityId,$id);
            $model->available_dates=$this->apptRepo->getAvailableDates(date('m',strtotime($date)),date('Y',
                    strtotime($date)),
                $id,$visitType,$this->getUserSessionId(),
                $hrs->StartTime,
                $hrs->EndTime,
                $first_available_provider_info['minutes']);

        }else{

            $provider_work_hours = $this->providerRepo->getProviderWorkHours($providerId,$facilityId,$visitType,$date);

            $overlapping_times = get_overlapping_hr($schedule_start_time,$schedule_end_time,
                $provider_work_hours->StartTime,$provider_work_hours->EndTime);

            $selected_start_time = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
                $facilityId,$visitType,$providerId,$date);

            $appts_slots=$this->getTimes($providerId,$facilityId,$visitType,$provider_work_hours->minutes,
                $provider_work_hours->StartTime,$provider_work_hours->EndTime,
                $overlapping_times['startTime'],$overlapping_times['endTime'],$date,$selected_start_time);


            $model->scheduler_slots = $appts_slots;
            $model->selectedProvider=$providerId;
            $model->firstAvailableProvider=0;
            $model->visitDuration=$provider_work_hours->minutes;


            //Available for month
            $hrs = $this->providerRepo->getProviderWorkHoursForMonth($visitType,$facilityId,$providerId);
            $model->available_dates=$this->apptRepo->getAvailableDates(date('m',strtotime($date)),date('Y',
                    strtotime($date)),
                $providerId,$visitType,$this->getUserSessionId(),
                $hrs->StartTime,
                $hrs->EndTime,
                $provider_work_hours->minutes);

        }

        $model->selectedDate=date('m/d/Y',strtotime($date));
        $model->providers[] = array("label" => $this->label,
            'items'=>$this->appendFirstAvailableProviderItem());
        //remove first available provider from the list
        $model->providers[] =
            array('label'=>'Providers','items'=> $providers);


        return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model,
            'back_link'=>$back_link))->title('Schedule
             Appointments');



    }


    /**
     * Function get called when tab is selected;
     * @return \Illuminate\Http\JsonResponse
     */

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
            $appts_slots =$this->build_appt_slot_view_model($provider_work_hours['times'],
                $selected_start_time,$provider_work_hours['startTime'],$provider_work_hours['endTime']);

            $model->firstAvailableProvider=$provider_work_hours['Id'];
        }
        else{
            $provider_work_hours = $this->providerRepo->getProviderWorkHours($providerId,$facilityId,$visitType,$date);

            $overlapping_times = get_overlapping_hr($schedule_start_time,$schedule_end_time,
                $provider_work_hours->StartTime,$provider_work_hours->EndTime);

            $appts_slots=$this->getTimes($providerId,$facilityId,$visitType,$provider_work_hours->minutes,
                $provider_work_hours->StartTime,$provider_work_hours->EndTime,
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

        return  \View::make('includes.timeslots',
        array('model' => $model));

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

    /**
     * GetAvailable dates for
     * the month */
    public function getAvailableDates(){

        $month  = \Input::get('month');
        $year = \Input::get('year');
        $providerId = \Input::get('providerId');
        $facilityId  = \Input::get('facility');

        $visitType = \Input::get('visitType');
        $firstAvailableProvider = \Input::get('firstAvailableProvider');

        $pId = $providerId==self::FIRST_AVAILABLE_PROVIDER?$firstAvailableProvider:$providerId;

        $provider_workhours = $this->providerRepo->getProviderWorkHoursForMonth($visitType,$facilityId,$pId);

        return $this->apptRepo->getAvailableDates($month,$year,
            $pId,$visitType,$this->getUserSessionId(),
            $provider_workhours->StartTime,$provider_workhours->EndTime,
            $provider_workhours->minutes);

    }


    public function getAvailableTimesAndDates(){


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
        $tabId = $inputs['tabId'];

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

        $model->email = $this->user_profile->email;

        $model->backUrl=
            link_to_action('NewAppointmentController@schedule', 'Back',array('facility'=>$facility,
                'providerId'=>$pId,'date'=>$date,'tabId'=>$tabId,
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

        $sendemail = isset($inputs['sendemail'])?$inputs['sendemail']:false;

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

            $model->backUrl=link_to_action('NewAppointmentController@schedule', 'Back',array('facility'=>$facility,
                    'visitType'=>$visitType),array('class'=>'button invert back'));

            return $this->view('pages.new-appointment-step3')->viewdata(array('model' => $model))
                ->title('Schedule Confirm');

        }

        //send email.- send email based on the consent
        if($sendemail==true){
            $this->sendEmail($return);

            //log apptconfemail
            $this->apptRepo->insertIntoApptCnfLog($return);

        }

        return \Redirect::action('HomeController@getIndex');

    }


    /***
     *
     * Clear session information
     *
     */
    public function clearsession(){
        $this->schedulerLogRepo->clearSessionData($this->getUserSessionId());
        \Session::set('session-expiration-message',$this->lang['session-expiration-message']);
        return \Redirect::action('NewAppointmentController@schedule',array('visitType'=>\Input::get('visitType'),
            'facility'=>\Input::get('facility')));

    }

    /*** HELPER **/
    function getTimes($providerId,$facilityId,$visitType,$visitTypeMinutes,$providerStartTime,$providerEndTime,
                      $startTime,$endTime,$encDate,
                      $selected_startTime=null){

        $duration = $visitTypeMinutes * 60;

        $available_times = $this->apptRepo->getAllAppointmentTimes($visitType,
            $providerId,
            $providerStartTime,
            $providerEndTime,$encDate,$this->getUserSessionId());


        //send appointment date
        return $this->build_time_slots($available_times,$duration,$startTime,$endTime,$selected_startTime,$encDate);

    }


    function build_time_slots($available_times,$duration,$startTime,$endTime,$selected_startTime,$encDate){
        $time_slots=array();

         foreach($available_times as $available){
            split_range_into_slots_by_duration($available['Available_from'],$available['Available_to'],
                $duration,
                $time_slots);
        }

        $filter_times = array_filter($time_slots,function($item)use($startTime,$endTime,$encDate){
            if($encDate==date('Y-m-d')){
                $timeNow = date('H:i');
                return $item>=$startTime && $item<=$endTime && $item>=$timeNow;
            }
            return $item>=$startTime && $item<=$endTime;
        });

        return $this->build_appt_slot_view_model($filter_times,$selected_startTime,$startTime,$endTime);


    }

    function build_appt_slot_view_model($filter_times,$selected_startTime,$startTime,$endTime){

        if(isset($selected_startTime)&& IsTimeInRange($selected_startTime,$startTime,$endTime))
            $filter_times[]=$selected_startTime;

        usort($filter_times,function($startTime1,$startTime2){
            $s1 = strtotime($startTime1);
            $s2 = strtotime($startTime2);
            return $s1<$s2?-1:($s1==$s2)?0:1;
        });


        $appts_slots = array();
        foreach ($filter_times as $slot) {
            $slot_model = new \AppointmentSlotViewModel();
            $slot_model->time = $slot;
            $slot_model->time_text = $slot;

            if((isset($selected_startTime) &&  IsTimeInRange($selected_startTime,$startTime,
                        $endTime)) && $selected_startTime==$slot){

                $slot_model->flag=true;

            }

            $appts_slots[] = $slot_model;


        }

        return $appts_slots;
    }

    public function sendEmail($encId){

        $message = $this->apptRepo->getEmailTemplateForAppointment($encId);
        return $this->emailService->send(array('name'=>$this->user_profile->getName(),
            'email'=>$this->user_profile->email,'message'=>$message,'subject'=>$this->lang['Appointment_Creation_Email_Subject']));
    }




}

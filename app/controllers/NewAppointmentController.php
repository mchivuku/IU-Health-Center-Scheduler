<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:30 PM
 */
namespace Scheduler\Controllers;


require_once app_path() . "/models/viewModels/SchedulerTabViewModel.php";
require_once app_path() . "/models/viewModels/NewAppointmentViewModel.php";
require_once app_path() . "/models/viewModels/SchedulerConfirmViewModel.php";
require app_path() . "/helpers/Utils.php";


class NewAppointmentController extends BaseController
{
    const FIRST_AVAILABLE_PROVIDER = 0;
    protected $label = 'First Available Provider';
    protected $schedulerDateRangeRepo;

    protected $header_title = array('label' => 'IU Health Center Appointments',
        'text' => 'Schedule an appointment or get information about appointments
                 you have already scheduled.');

    public function  __construct($app)
    {
        parent::__construct($app);
        $this->layout = 'layouts.new-appointment';
        $this->schedulerDateRangeRepo=$app->SchedulerDateRangeRepository;

    }

    /**
     *  Function to check if the logged in user is staff or faculty
     */
    private function IsFacultyStaff()
    {
        // $affiliations = explode(";", $this->getPersonAffiliation()); - employee, member alum
        $affiliations = $this->getPersonAffiliation();

        $student = false;
        foreach ($affiliations as $a) {
            if (strtolower($a) == 'student'){
                $student = true;
                break;
            }
        }
        return !$student;
    }

    //Get facility based on person's affiliation and database settings
    private function getFacilities(){
        $facultyStaffPersonnel = $this->IsFacultyStaff();

        if ($facultyStaffPersonnel == 1) {
            $facilities = $this->facilitiesRepo->getAllFacultyStaffFacilities();

        } else {
            $facilities = $this->facilitiesRepo->getAllFacilities();

        }
        return $facilities;
    }

    /**
     * Function to return index view for the new appointment - loads the form with facilities
     * and visitTypes
     */
    public function getIndex()
    {
        $model = new \NewAppointmentViewModel();
        $facility = \Input::get('facility');
        $visitType = \Input::get('visitType');



        $model->facilities = $this->getFacilities();

        if (count($model->facilities) > 0){
            foreach($model->facilities as $fac){
                if($facility==$fac->Id){
                    $model->selectedFacility=$fac->Id;
                    break;
                }
            }


            if(!isset($model->selectedFacility)){
               $first =  reset($model->facilities);
               $model->selectedFacility = $first->Id;
            }


            //chart title of the facilities is linked back to visit type
            $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes($model->selectedFacility);
            foreach($model->visitTypes as $v){
                if($visitType==$v->Id){
                    $model->selectedvisitType = $v->Id;
                    break;
                }
            }


            if(!isset($model->selectedvisitType)){
                $first = reset($model->visitTypes);
                $model->selectedvisitType = $first->Id;
            }

        }


        return $this->view('pages.new-appointment-step1')
            ->viewdata(array('model' => $model))
            ->title('New Appointment');
    }



    /***
     * Function to return json response for visitTypes for a given facilityId
     * @return mixed
     */
    public function getVisitTypes()
    {
        $facilityId = \Input::get('facilityId');

        return \Response::json((array_map(function ($item) {
            return (array("id" => $item->Id, "name" => $item->Name));
        }, $this->visitTypeRepo->getAllVisitTypes($facilityId))));
    }

    /**
     *
     * Function to return providers and schedules, check facility if staff is allowed.
     *
     * 1. facility check, weekend check
     *
     */
    public function schedule()
    {
        $facilityId = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $date = \Input::get('date');
        $providerId = \Input::get('providerId');

        $model = new \SchedulerTabViewModel();

        $model->selectedDate =  date('m/d/Y', strtotime($date));
        $model->validDateRange =  $this->schedulerDateRangeRepo->getValidDateRange();

        $facilities=$this->getFacilities();

        /* back link */
        $params = array('visitType' => $visitType, 'facility' => $facilityId);
        $queryString = http_build_query($params);
        $back_link = \URL::to(action('NewAppointmentController@getIndex') . "?" . $queryString);


        $schedule_times = new \ScheduleTimes();

        if (!isset($date)){
            $date = date("Y-m-d");
        }


        // if it is a weekend - do not load - return to no providers page, check if the facility Id is allowed for
        // given person affiliation
        $valid_facility = false;
        foreach($facilities as $fac){
            if($fac->Id==$facilityId){
                $valid_facility=true;
                break;
            }
        }


        $dayOfweek = \Config::get('settings.dayOfweek');


        if((\Config::get('settings.weekends') && (getDayOfTheWeek($date)== $dayOfweek['Sat'] || getDayOfTheWeek($date)==
                $dayOfweek['Sun'])) ||
        !$valid_facility)
            return $this->view('pages.new-appointment-step2-noproviders')
                ->viewdata(array('message' => $this->lang['noProviders'],'visitType'=>$visitType,
                    'facility'=>$facilityId,'validDateRange'=>$model->validDateRange ,
                    'back_link' => $back_link))
                ->title('Schedule Appointments');

        if (!isset($tabId) || $tabId == "")
            $tabId = \ScheduleTimes::DAY;

         // Get All Providers
        $providers = $this->providerRepo->getAllProvidersWithWorkHours($facilityId, $visitType, $date);


        // empty providers - return
        if (empty($providers)){
            return $this->view('pages.new-appointment-step2-noproviders')
                ->viewdata(array('message' => $this->lang['noProviders'],'visitType'=>$visitType,
                    'facility'=>$facilityId,'validDateRange'=>$model->validDateRange ,
                    'back_link' => $back_link))
            ->title
                ('Schedule Appointments');
        }


        //If there are providers - get the first available provider
        $model->tabs = $schedule_times->getTabsForScheduleTimes();
        if (!isset($tabId))
            $tabId = key($model->tabs);

        $model->activeTab = $tabId;
        $model->visitType = $visitType;
        $model->facility = $facilityId;


        // First time - get first available provider
        if (!isset($providerId)) {
            $result = $this->getAppointmentTimesForFirstAvailableProvider($facilityId, $visitType, $date,$tabId, true);
        }else {
            $result = $this->getAppointmentTimesForProvider($facilityId, $visitType, $date, $tabId, $providerId,true);
        }

        // No times available return -
        if(empty($result)){
            return $this->view('pages.new-appointment-step2-noproviders')
                ->viewdata(array('message' => $this->lang['noProviders'],'visitType'=>$visitType,
                    'facility'=>$facilityId,'validDateRange'=>$model->validDateRange ,
                    'back_link' => $back_link))
                ->title
                ('Schedule Appointments');
        }


        $model->selected_startTime = $result['selected_start_time'];
        $model->scheduler_slots = $result['scheduler_slots'];
        $model->selectedProvider = $result['selectedProvider'];
        $model->visitDuration = $result['visitDuration'];
        $model->available_dates = $result['available_dates'];
        $model->firstAvailableProvider = $result['firstAvailableProvider'];

        $model->providers[] = array("label" => $this->label,
            'items' => $this->appendFirstAvailableProviderItem());

        $model->providers[] =
            array('label' => 'Providers', 'items' => $providers);


        return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model,
            'back_link' => $back_link))->title('Schedule
             Appointments');

    }

    /** Helper functions */

    function getAppointmentTimesForFirstAvailableProvider($facilityId, $visitType, $date, $tabId, $get_dates = false)
    {
        $result = array();
        $session_id = $this->getUserSessionId();

        $first_available_provider_info = $this->providerRepo->getFirstAvailableProviderTimes($facilityId,
            $visitType, $date, $tabId,$session_id);


        if(!isset($first_available_provider_info) ||$first_available_provider_info=='')
        {
             return '';
        }


        $id = $first_available_provider_info['Id'];
        $selected_start_time = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
            $facilityId, $visitType, $id, $date);

        $result['selected_start_time'] = $selected_start_time;


        $result['scheduler_slots'] = $this->build_appt_slot_view_model($first_available_provider_info['times'],
            $selected_start_time, $first_available_provider_info['startTime'],
            $first_available_provider_info['endTime'],
            $first_available_provider_info['past_times']);


        $result['selectedProvider'] = self::FIRST_AVAILABLE_PROVIDER;
        $result['firstAvailableProvider'] = $id;
        $result['visitDuration'] = $first_available_provider_info['minutes'];


        //Available for month
        if ($get_dates) {
            $hrs = $this->providerRepo->getProviderWorkHoursForMonth($visitType, $facilityId, $id,$date);

            $result['available_dates'] = $this->providerRepo->getAvailableDates(date('m', strtotime($date)), date('Y',
                    strtotime($date)),
                $id, $visitType,$facilityId, $this->getUserSessionId(),
                $hrs->StartTime,
                $hrs->EndTime,
                $first_available_provider_info['minutes']);
        }

        return $result;

    }

    function build_appt_slot_view_model($filter_times, $selected_startTime, $startTime, $endTime, $past_times)
    {

        if (isset($selected_startTime) && IsTimeInRange($selected_startTime, $startTime,
                $endTime) && !in_array($selected_startTime, $filter_times)
        )
            $filter_times[] = $selected_startTime;


        if($filter_times>2){
            usort($filter_times, function ($startTime1, $startTime2) {
                $s1 = strtotime($startTime1);
                $s2 = strtotime($startTime2);
                return $s1 < $s2 ? -1 : ($s1 == $s2) ? 0 : 1;
            });
        }


        $appts_slots = array();
        foreach ($filter_times as $slot) {
            $slot_model = new \AppointmentSlotViewModel();
            $slot_model->time = $slot;
            $slot_model->time_text = $slot;

            if ((isset($selected_startTime) && IsTimeInRange($selected_startTime, $startTime,
                        $endTime)) && $selected_startTime == $slot
            ) {

                $slot_model->flag = true;

            } else {
                $slot_model->flag = false;
            }

            if (in_array($slot, $past_times)) {
                $slot_model->past_time_flag = true;
            } else {
                $slot_model->past_time_flag = false;

            }

            $appts_slots[] = $slot_model;

        }

        return $appts_slots;
    }

    function getAppointmentTimesForProvider($facilityId, $visitType, $date, $scheduleID, $providerId,
                                            $get_dates = false)
    {

        $result = array();

        $available_times = $this->providerRepo->getAllAppointmentTimes($facilityId, $visitType,
            $providerId, $scheduleID,
            $date,$this->getUserSessionId());


        $result['selected_start_time'] = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
            $facilityId, $visitType, $providerId, $date);

        $result['scheduler_slots'] = $this->build_appt_slot_view_model($available_times['times'],
            $result['selected_start_time'], $available_times['startTime'], $available_times['endTime'],
            $available_times['past_times']);

        $result['selectedProvider'] = $providerId;
        $result['firstAvailableProvider'] = 0;
        $result['visitDuration'] = $available_times['minutes'];

        //Available for month
        if ($get_dates){
            $hrs = $this->providerRepo->getProviderWorkHoursForMonth($visitType, $facilityId, $providerId,$date);
            $result['available_dates'] = $this->providerRepo->getAvailableDates(date('m', strtotime($date)), date('Y',
                    strtotime($date)),
                $providerId, $visitType,$facilityId, $this->getUserSessionId(),
                $hrs->StartTime,
                $hrs->EndTime,
                $available_times['minutes']);
        }

        return $result;
    }

    private function appendFirstAvailableProviderItem()
    {

        return array(array('Id' => self::FIRST_AVAILABLE_PROVIDER,
            'Name' => 'First Available Provider', 'selected' => true));
    }

    /**
     * Function get called when tab is selected;
     * @return \Illuminate\Http\JsonResponse
     */

    public function getAvailableTimes()
    {

        $facilityId = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $providerId = \Input::get('providerId');
        $input_date = \Input::get('date');


        $error_msg = \Input::get('error_msg');

        $model = new \SchedulerTabViewModel();
        $date = parseDateString($input_date);


        //first available provider - was selected
        if ($providerId == 0) {
            $result = $this->getAppointmentTimesForFirstAvailableProvider($facilityId, $visitType, $date, $tabId, false);

        } else {

            $result = $this->getAppointmentTimesForProvider($facilityId, $visitType, $date, $tabId, $providerId);


        }



        $model->firstAvailableProvider = $result['firstAvailableProvider'];
        $model->visitDuration = $result['visitDuration'];
        $model->scheduler_slots = $result['scheduler_slots'];
        $model->tabs = array(\ScheduleTimes::DAY => 'Morning', \ScheduleTimes::AFTERNOON => "Afternoon");
        $model->activeTab = $tabId;
        $model->selected_startTime = $result['selected_start_time'];
        $model->errorMsg = $error_msg;


        return \View::make('includes.timeslots',
            array('model' => $model));

    }

    /***
     *
     * @return mixed
     */
    function saveSelectedTime()
    {
        $session_id = $this->getUserSessionId();

        $facilityId = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $providerId = \Input::get('providerId');
        $input_date = \Input::get('date');
        $startTime = \Input::get('startTime');
        $duration = \Input::get('visitDuration');
        $tabId = \Input::get('tabId');


        $endTime = getEndTime($startTime, convertMinToSec($duration));

        $date = parseDateString($input_date);
        $result = false;


        $model = new \SchedulerTabViewModel();

        if ($providerId == self::FIRST_AVAILABLE_PROVIDER){

            //get first provider - check if time is available - save
             $first_available_provider_info = $this->providerRepo
                ->getFirstAvailableProviderTimes($facilityId,
                    $visitType, $date, $tabId,$session_id);

            $id = $first_available_provider_info['Id'];

            // If time is available - save
            if (in_array($startTime, $first_available_provider_info['times'])){
                $result = $this->schedulerLogRepo->saveSelectedTime($session_id, $this->getUniversityId(),
                    $facilityId, $visitType, $id,
                    $date, $startTime,
                    $endTime);

               if(!$result){
                    $model->errorMsg=$this->lang['Unable_to_select_start_time'];
                    $model->selected_startTime=$this->schedulerLogRepo->getSelectedTime($session_id,
                       $facilityId, $visitType, $id, $date);
                }else{
                   $model->selected_startTime=$startTime;
               }

            }

            $model->firstAvailableProvider = $id;
            $model->visitDuration = $first_available_provider_info['minutes'];


            $model->scheduler_slots =
                $this->build_appt_slot_view_model
                ($first_available_provider_info['times'],
                    $model->selected_startTime, $first_available_provider_info['startTime'],
                    $first_available_provider_info['endTime'],
                    $first_available_provider_info['past_times']);

            $model->tabs = array(\ScheduleTimes::DAY => 'Morning',
                \ScheduleTimes::AFTERNOON => "Afternoon");
            $model->activeTab = $tabId;

            return \View::make('includes.timeslots',
                array('model' => $model));

        }

        $save_result = $this->schedulerLogRepo->saveSelectedTime($session_id, $this->getUniversityId(),
                $facilityId, $visitType, $providerId, $date, $startTime,
                $endTime);

        $result = $this->getAppointmentTimesForProvider($facilityId, $visitType, $date, $tabId, $providerId);

        $model->scheduler_slots = $result['scheduler_slots'];
        $model->selectedProvider = $result['selectedProvider'];
        $model->visitDuration = $result['visitDuration'];
        $model->firstAvailableProvider = $result['firstAvailableProvider'];
        $model->tabs = array(\ScheduleTimes::DAY => 'Morning', \ScheduleTimes::AFTERNOON => "Afternoon");
        $model->activeTab = $tabId;


        if (!$save_result){
            $model->errorMsg=$this->lang['Unable_to_select_start_time'];
        }else{
            $model->selected_startTime = $result['selected_start_time'];

        }

        return \View::make('includes.timeslots',array('model' => $model));

    }

    /**
     * GetAvailable dates for
     *
     * the month */
    public function getAvailableDates()
    {

        $month = \Input::get('month');
        $year = \Input::get('year');
        $providerId = \Input::get('providerId');
        $facilityId = \Input::get('facility');

        $visitType = \Input::get('visitType');
        $firstAvailableProvider = \Input::get('firstAvailableProvider');

        $pId = $providerId == self::FIRST_AVAILABLE_PROVIDER ? $firstAvailableProvider : $providerId;


        $datestring = sprintf("%d-%d-01",$year,$month);

        $date =  date("Y-m-d", strtotime($datestring));


        $provider_workhours = $this->providerRepo->getProviderWorkHoursForMonth($visitType, $facilityId, $pId,$date);

        return $this->providerRepo->getAvailableDates($month, $year,
            $pId, $visitType, $facilityId,$this->getUserSessionId(),
            $provider_workhours->StartTime, $provider_workhours->EndTime,
            $provider_workhours->minutes);

    }

    /***
     *
     * Clear session information
     *
     */
    public function clearsession()
    {
        $this->schedulerLogRepo->clearSessionData($this->getUserSessionId());

        \Session::flash('session-expiration-message', $this->lang['session-expiration-message']);

        return \Redirect::action('NewAppointmentController@getIndex', array('visitType' => \Input::get('visitType'),
            'facility' => \Input::get('facility')));

    }

    /***
     *
     * Schedule Confirm
     */
    public function  scheduleConfirm()
    {

        // Get all inputs.
        $inputs = \Input::all();

        //read all post variables
        $facility = $inputs['facility'];
        $visitType = $inputs['visitType'];
        $providerId = $inputs['provider'];
        $input_date = $inputs['date'];
        $startTime = $inputs['startTime'];
        $duration = $inputs['visitDuration'];
        $firstAvailableProvider = $inputs['firstAvailableProvider'];
        $tabId = $inputs['tabId'];

        $endTime = getEndTime($startTime, convertMinToSec($duration));

        $date = parseDateString($input_date);

        $pId = $providerId == self::FIRST_AVAILABLE_PROVIDER ? $firstAvailableProvider : $providerId;

        $model = new \SchedulerConfirmViewModel();
        $model->providerId = $pId;
        $model->providerName = $this->providerRepo->getProviderName($pId);
        $model->visitType = $visitType;
        $model->visitTypeText = $this->visitTypeRepo->getVisitTypeName($visitType);
        $model->encDate = $date;
        $model->facility = $facility;

        $model->displayDate = $date;
        $model->startTime = $startTime;
        $model->visitDuration = $duration;
        $model->endTime = $endTime;

        $model->email = $this->user_profile->email;

        $model->backUrl =
            link_to_action('NewAppointmentController@schedule', 'Back', array('facility' => $facility,
                'providerId' => $pId, 'date' => $date, 'tabId' => $tabId,
                'visitType' => $visitType), array('class' => 'button invert back'));


        return $this->view('pages.new-appointment-step3')->viewdata(array('model' => $model))
            ->title('Schedule Confirm');


    }

    /***
     * Schedule Save - function gets called on post from the schedule page.
     */
    public function  scheduleSave()
    {
        // Get all inputs.
        $inputs = \Input::all();

        //read all post variables
        $visitType = $inputs['visitType'];
        $providerId = $inputs['provider'];
        $input_date = $inputs['date'];
        $startTime = $inputs['startTime'];
        $facility = $inputs['facility'];

        $duration = $inputs['visitDuration'];
        $endTime = $inputs['endTime'];

        $sendemail = isset($inputs['sendemail']) ? $inputs['sendemail'] : false;

        $date = parseDateString($input_date);

        $model = new \Appointment();
        $model->startTime = $startTime;
        $model->providerId = $providerId;
        $model->visitType = $visitType;
        $model->endTime = $endTime;
        $model->date = $date;
        $model->email = $this->user_profile->email;

        $return = $this->apptRepo->createAppointment($this->getUniversityId(), $this->getUserSessionId(),
            $model);

        if ($return == false) {

            $model = new \SchedulerConfirmViewModel();
            $model->providerId = $providerId;
            $model->providerName = $this->providerRepo->getProviderName($providerId);
            $model->visitType = $visitType;
            $model->visitTypeText = $this->visitTypeRepo->getVisitTypeName($visitType);
            $model->encDate = $date;
            $model->email = $this->user_profile->email;

            $model->displayDate = $date;
            $model->startTime = $startTime;
            $model->visitDuration = $duration;
            $model->endTime = $endTime;
            $model->facility = $facility;

            $model->errorMsg = "Appointment could not be made";

            $model->backUrl = link_to_action('NewAppointmentController@schedule', 'Back', array('facility' => $facility,
                'visitType' => $visitType), array('class' => 'button invert back'));

            return $this->view('pages.new-appointment-step3')->viewdata(array('model' => $model))
                ->title('Schedule Confirm');

        }

        //send email.- send email based on the consent
        if ($sendemail == true) {
            $this->sendEmail($return);
            //log apptconfemail
            $this->apptRepo->insertIntoApptCnfLog($return);

        }

        return \Redirect::action('HomeController@getIndex');

    }

    public function sendEmail($encId)
    {

        $appointment = $this->apptRepo->getAppointment($encId);

        //time format
        $hours = date('H', strtotime($appointment->startTime));
        $ext = ($hours < 12) ? 'a.m.' : 'p.m.';
        $time_display = date('g:i',
                strtotime($appointment->startTime)) . " " . $ext;

        $data = array('visitType'=>$appointment->visitType,'providerName'=>$appointment->getProviderName(),
           'facility'=>$appointment->facility,'date'=>date('Y-m-d', strtotime($appointment->date)),'startTime'=>
            $time_display);


        $email = $this->user_profile->email;
        $name =  $this->user_profile->getName();
        $subject = $this->lang['Appointment_Creation_Email_Subject'];

        \Mail::send('emails.appointment-confirmation', $data, function($message)use($email,
            $name,$subject)
        {
            $message->to($email, $name)->subject($subject);
        });

    }


}

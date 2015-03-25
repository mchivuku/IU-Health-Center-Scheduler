<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:30 PM
 */
namespace Scheduler\Controllers;

ini_set('display_errors',1);
error_reporting(-1);


use Illuminate\Support\Facades\Response;

require_once app_path() . "/models/viewModels/SchedulerTabViewModel.php";
require_once app_path() . "/models/viewModels/NewAppointmentViewModel.php";
require_once app_path() . "/models/viewModels/SchedulerConfirmViewModel.php";
require app_path() . "/helpers/Utils.php";


class NewAppointmentController extends BaseController
{
    const FIRST_AVAILABLE_PROVIDER = 0;
    protected $label = 'First Available Provider';

    protected $header_title = array('label' => 'IU Health Center Appointments',
        'text' => 'Schedule an appointment or get information about appointments
                 you have already scheduled.');

    public function  __construct($app)
    {
        parent::__construct($app);
        $this->layout = 'layouts.new-appointment';

    }


    private function appendFirstAvailableProviderItem()
    {

        return array(array('Id' => self::FIRST_AVAILABLE_PROVIDER,
            'Name' => 'First Available Provider', 'selected' => true));
    }


    /**
     * Function to return index view for the new appointment - loads the form with facilities
     * and visitTypes
     */
    public function getIndex()
    {

        $model = new \NewAppointmentViewModel();

        $model->selectedFacility = \Input::get('facility');
        $model->selectedvisitType = \Input::get('visitType');

        $facultyStaffPersonnel = $this->checkIsFacultyOrStaff();

        if ($facultyStaffPersonnel == 1) {
            $model->facilities = $this->facilitiesRepo->getAllFacultyStaffFacilities();

        } else {
            $model->facilities = $this->facilitiesRepo->getAllFacilities();

        }

        if (count($model->facilities) > 0) {
            if (isset($model->selectedFacility)) {
                $facility = $model->selectedFacility;
            } else {
                $f = current($model->facilities);
                $facility = $f->Id;

            }
            //chart title of the facilities is linked back to visit type
            $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes($facility);

        }


        return $this->view('pages.new-appointment-step1')
            ->viewdata(array('model' => $model))
            ->title('New Appointment');
    }

    /**
     *  Function to check if the logged in user is staff or faculty
     */
    private function checkIsFacultyOrStaff()
    {
        $affiliations = explode(";", $this->getPersonAffiliation());
        $staffFaculty = false;
        foreach ($affiliations as $a) {
            if (strtolower($a) == 'staff' || strtolower($a) == 'faculty') {
                $staffFaculty = true;
                break;
            }
        }
        return $staffFaculty;
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
     * Function to return providers and schedules
     *
     */
    public function schedule()
    {
        $facilityId = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $date = \Input::get('date');
        $providerId = \Input::get('providerId');


        /* back link */
        $params = array('visitType' => $visitType, 'facility' => $facilityId);
        $queryString = http_build_query($params);
        $back_link = \URL::to(action('NewAppointmentController@getIndex') . "?" . $queryString);


        $schedule_times = new \ScheduleTimes();

        if (!isset($date))
            $date = date('Y-m-d');
        if (!isset($tabId) || $tabId == "")
            $tabId = \ScheduleTimes::DAY;


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
        $model->tabs = $schedule_times->getTabsForScheduleTimes();
        if (!isset($tabId))
            $tabId = key($model->tabs);

        $model->activeTab = $tabId;
        $model->visitType = $visitType;
        $model->facility = $facilityId;


        // First time - get first available provider
        if (!isset($providerId)) {
            $result = $this->getAppointmentTimesForFirstAvailableProvider($facilityId, $visitType, $date,
                $schedule_start_time,
                $schedule_end_time, true);


        }else {

            $result= $this->getAppointmentTimesForProvider($facilityId,$visitType,$date,$schedule_start_time,
                $schedule_end_time,$providerId,
                true);

        }

        $model->selected_startTime= $result['selected_start_time'];
        $model->scheduler_slots=$result['scheduler_slots'];
        $model->selectedProvider=$result['selectedProvider'];
        $model->visitDuration=$result['visitDuration'];
        $model->available_dates=$result['available_dates'];
        $model->firstAvailableProvider=$result['firstAvailableProvider'];


        $model->selectedDate = date('m/d/Y', strtotime($date));
        $model->providers[] = array("label" => $this->label,
            'items' => $this->appendFirstAvailableProviderItem());

        $model->providers[] =
            array('label' => 'Providers', 'items' => $providers);


        return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model,
            'back_link' => $back_link))->title('Schedule
             Appointments');


    }


    /**
     * Function get called when tab is selected;
     * @return \Illuminate\Http\JsonResponse
     */

    public function getAvailableTimes()
    {

        $schedule_times = new \ScheduleTimes();

        $facilityId = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $providerId = \Input::get('providerId');
        $input_date = \Input::get('date');


        $error_msg = \Input::get('error_msg');



        $model = new \SchedulerTabViewModel();
        $date = parseDateString($input_date);
        $schedule_start_time = $schedule_times->getStartTimeForDay($tabId);
        $schedule_end_time = $schedule_times->getEndTimeForDay($tabId);

        //first available provider - was selected
        if ($providerId == 0){

            $result =  $this->getAppointmentTimesForFirstAvailableProvider($facilityId,$visitType,$date,
                $schedule_start_time,
                $schedule_end_time,false);

        }else{

            $result =$this->getAppointmentTimesForProvider($facilityId,$visitType,$date,$schedule_start_time,
                $schedule_end_time,$providerId);

        }


        $model->firstAvailableProvider = $result['firstAvailableProvider'];

        $model->visitDuration=$result['visitDuration'];
        $model->scheduler_slots = $result['scheduler_slots'];
        $model->tabs = array(\ScheduleTimes::DAY => 'Morning', \ScheduleTimes::AFTERNOON => "Afternoon");
        $model->activeTab = $tabId;
        $model->selected_startTime = $result['selected_start_time'];


        $model->errorMsg=$error_msg;


        return \View::make('includes.timeslots',
            array('model' => $model));

    }

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
        $result=false;

        $parameters =array('facility' => $facilityId,
            'visitType'=>$visitType,'providerId'=>$providerId,
            'date'=>$input_date,'tabId'=>$tabId);

        if($providerId==self::FIRST_AVAILABLE_PROVIDER){
             $schedule_times = new \ScheduleTimes();

            //get first provider - check if time is available - save
            $schedule_start_time=$schedule_times->getStartTimeForDay($tabId);
            $schedule_end_time = $schedule_times->getEndTimeForDay($tabId);

            $first_available_provider_info = $this->providerRepo
                ->getFirstAvailableProviderWorkHours($facilityId,
                    $visitType, $date, $schedule_start_time, $schedule_end_time);


            $id = $first_available_provider_info['Id'];




             if(in_array($startTime,$first_available_provider_info['times']))
                {
                  $result = $this->schedulerLogRepo->saveSelectedTime($session_id, $this->getUniversityId(),
                    $facilityId, $visitType, $id,
                    $date, $startTime,
                    $endTime);


                if($result){

                    $model = new \SchedulerTabViewModel();

                    $model->firstAvailableProvider = $id;
                    $model->visitDuration=$first_available_provider_info['minutes'];
                    $model->scheduler_slots = $this->build_appt_slot_view_model
                    ($first_available_provider_info['times'],
                        $startTime, $first_available_provider_info['startTime'],
                        $first_available_provider_info['endTime'],
                        $first_available_provider_info['past_times']);

                    $model->tabs = array(\ScheduleTimes::DAY => 'Morning',
                        \ScheduleTimes::AFTERNOON => "Afternoon");
                    $model->activeTab = $tabId;


                    return  \View::make('includes.timeslots',
                        array('model' => $model));


                }

            }else{

                 if(!$result){
                     $parameters['error_msg']=  $this->lang['Unable_to_select_start_time'];
                 }


             }
        }
        else{
            $result = $this->schedulerLogRepo->saveSelectedTime($session_id, $this->getUniversityId(),
                $facilityId, $visitType, $providerId, $date, $startTime,
                $endTime);
            if($result==false){
                $parameters['error_msg']=  $this->lang['Unable_to_select_start_time'];
            }

        }


        return \Redirect::action('NewAppointmentController@getAvailableTimes', $parameters);






    }

    /**
     * GetAvailable dates for
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

        $provider_workhours = $this->providerRepo->getProviderWorkHoursForMonth($visitType, $facilityId, $pId);

        return $this->apptRepo->getAvailableDates($month, $year,
            $pId, $visitType, $this->getUserSessionId(),
            $provider_workhours->StartTime, $provider_workhours->EndTime,
            $provider_workhours->minutes);

    }

    /***
     *
     * Clear session information
     *
     */
    public function clearsession(){
        $this->schedulerLogRepo->clearSessionData($this->getUserSessionId());
        \Session::flash('session-expiration-message',$this->lang['session-expiration-message']);
        return \Redirect::action('NewAppointmentController@getIndex',array('visitType'=>\Input::get('visitType'),
            'facility'=>\Input::get('facility')));

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

        $message = $this->apptRepo->getEmailTemplateForAppointment($encId);
        return $this->emailService->send(array('name' => $this->user_profile->getName(),
            'email' => $this->user_profile->email, 'message' => $message, 'subject' => $this->lang['Appointment_Creation_Email_Subject']));
    }


    /** Helper functions */

    function getAppointmentTimesForFirstAvailableProvider($facilityId,$visitType,$date,$schedule_start_time,
                                                          $schedule_end_time,$get_dates=false)
    {
        $result = array();

        $first_available_provider_info = $this->providerRepo
            ->getFirstAvailableProviderWorkHours($facilityId,
                $visitType, $date, $schedule_start_time, $schedule_end_time);


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
        if($get_dates){
            $hrs = $this->providerRepo->getProviderWorkHoursForMonth($visitType, $facilityId, $id);
            $result['available_dates'] = $this->apptRepo->getAvailableDates(date('m', strtotime($date)), date('Y',
                    strtotime($date)),
                $id, $visitType, $this->getUserSessionId(),
                $hrs->StartTime,
                $hrs->EndTime,
                $first_available_provider_info['minutes']);
        }

        return $result;


    }

    function getAppointmentTimesForProvider($facilityId,$visitType,$date,$schedule_start_time,
                                            $schedule_end_time,$providerId,
                                            $get_dates=false)
    {

        $result = array();

        $available_times = $this->apptRepo->getAllAppointmentTimes($facilityId, $visitType,
            $providerId, $schedule_start_time, $schedule_end_time,
            $date);


        $result['selected_start_time'] = $this->schedulerLogRepo->getSelectedTime($this->getUserSessionId(),
            $facilityId, $visitType, $providerId, $date);

        $result['scheduler_slots'] = $this->build_appt_slot_view_model($available_times['times'],
            $result['selected_start_time'] , $available_times['startTime'], $available_times['endTime'],
            $available_times['past_times']);

        $result['selectedProvider'] = $providerId;
        $result['firstAvailableProvider'] = 0;
        $result['visitDuration'] =  $available_times['minutes'];



        //Available for month
        if($get_dates) {
            $hrs = $this->providerRepo->getProviderWorkHoursForMonth($visitType, $facilityId, $providerId);
            $result['available_dates'] = $this->apptRepo->getAvailableDates(date('m', strtotime($date)), date('Y',
                    strtotime($date)),
                $providerId, $visitType, $this->getUserSessionId(),
                $hrs->StartTime,
                $hrs->EndTime,
                $available_times['minutes']);
        }

        return $result;
    }


    function build_appt_slot_view_model($filter_times, $selected_startTime, $startTime, $endTime, $past_times)
    {

        if (isset($selected_startTime) && IsTimeInRange($selected_startTime, $startTime,
                $endTime)&&!in_array($selected_startTime,$filter_times))
            $filter_times[] = $selected_startTime;


        usort($filter_times, function ($startTime1, $startTime2) {
            $s1 = strtotime($startTime1);
            $s2 = strtotime($startTime2);
            return $s1 < $s2 ? -1 : ($s1 == $s2) ? 0 : 1;
        });


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

            if(in_array($slot,$past_times)){
                $slot_model->past_time_flag=true;
            }else{
                $slot_model->past_time_flag=false;

            }

            $appts_slots[] = $slot_model;

        }

        return $appts_slots;
    }



}

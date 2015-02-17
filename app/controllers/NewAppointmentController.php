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
require app_path() . "/helpers/Utils.php";

class NewAppointmentController extends BaseController
{

    public function  __construct($app)
    {
        parent::__construct($app);
        $this->layout=  'layouts.new-appointment';
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

        $model = new \SchedulerTabViewModel();
        $model->tabs =$schedule_times->getTabsForScheduleTimes();
        $model->providers = $this->providerRepo->getAllProvidersWithWorkHours($facilityId,$visitType,date("Y-m-d"));


        if(!isset($tabId))
            $tabId = key($model->tabs);

        if(!isset($date))
            $date = date('Y-m-d');

        //TODO - replace with first available provider
        $default_provider = current($model->providers);

        $model->activeTab = $tabId;
        $model->selectedProvider = $default_provider->Id;
        $model->visitType= $visitType;

        $startTime = $default_provider->StartTime;
        $endTime   = $default_provider->EndTime;


        $this->apptRepo->getAllAppointmentTimes($default_provider,$date);

        exit;

        $all_days_slots = array();

        $appts_slots = array();
        foreach ($all_days_slots as $slot) {
            $slot_model = new \AppointmentSlotViewModel();
            $slot_model->time = $slot;
            $slot_model->time_text = $slot;
            $slot_model->flag = true;
            $appts_slots[] = $slot_model;

        }
        $model->scheduler_slots =$appts_slots;


        return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model))->title('Schedule
        Appointments');

    }

    public function getAvailableTimes(){

        $schedule_times = new \ScheduleTimes();

        $facilityId  = \Input::get('facility');
        $visitType = \Input::get('visitType');
        $tabId = \Input::get('tabId');
        $providerId = \Input::get('providerId');
        $date = \Input::get('date');

        $provider_work_hours = $this->providerRepo->getProviderWorkHours($providerId,$facilityId,$visitType,$date);

        $schedule_start_time = $schedule_times->getStartTimeForDay($tabId);
        $schedule_end_time = $schedule_times->getEndTimeForDay($tabId);

        $overlapping_times = get_overlapping_hr($schedule_start_time,$schedule_end_time,
            $provider_work_hours->StartTime,$provider_work_hours->EndTime);

        if(!isset($overlapping_times))return 'no overlapping times found';

        $all_days_slots = array();
        $this->get_split_into_slots($overlapping_times['startTime'], $overlapping_times['startTime'], $all_days_slots);

        $appts_slots = array();
        foreach ($all_days_slots as $slot) {
            $slot_model = new \AppointmentSlotViewModel();
            $slot_model->time = $slot;
            $slot_model->time_text = $slot;
            $slot_model->flag = true;
            $appts_slots[] = $slot_model;

        }
        $model = new \SchedulerTabViewModel();
        $model->scheduler_slots = $appts_slots;
        $model->tabs = array(\ScheduleTimes::DAY=>'Morning',\ScheduleTimes::AFTERNOON=>"Afternoon");
        $model->activeTab = $tabId;

        return \View::make('includes.timeslots', array('model' => $model));
    }

}

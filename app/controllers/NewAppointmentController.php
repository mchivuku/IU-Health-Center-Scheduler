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
     * Function to create new appointment.
     */
    public function getIndex()
    {

        $model = new \NewAppointmentViewModel();

        $model->selectedFacility = \Filter::filterInput(INPUT_GET, 'facility',
            FILTER_SANITIZE_SPECIAL_CHARS | FILTER_SANITIZE_ENCODED);
        $model->selectedvisitType = \Filter::filterInput(INPUT_GET, 'visitType',
            FILTER_SANITIZE_SPECIAL_CHARS | FILTER_SANITIZE_ENCODED);


        $model->facilities = $this->facilitiesRepo->getAllFacilities();


        $facility = current($model->facilities);
        $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes($facility->Id);

        return $this->view('pages.new-appointment-step1')->viewdata(array('model' => $model))->title('New
         Appointment');

    }

    //Return json response for visit type dropdowns;
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

        $model = new \SchedulerTabViewModel();
        $model->tabs = array(\ScheduleTimes::DAY=>'Morning',\ScheduleTimes::AFTERNOON=>"Afternoon");
        $model->providers = $this->providerRepo->getProvidersWithWorkHours($facilityId,$visitType,date("Y-m-d"));
        $model->activeTab = $tabId;
        $model->selectedProvider = $model->providers[0]->Id;
        $model->visitType= $visitType;

        $default_provider = current($model->providers);

        $startTime = $default_provider->StartTime;
        $endTime =
         $default_provider->EndTime;

        $all_days_slots = array();
        $this->get_split_into_slots($startTime, $endTime, $all_days_slots);

        $appts_slots = array();
        foreach ($all_days_slots as $slot) {
            $slot_model = new \AppointmentSlotViewModel();
            $slot_model->time = $slot;
            $slot_model->time_text = $slot;
            $slot_model->flag = true;
            $appts_slots[] = $slot_model;

        }
        $model->scheduler_slots =$appts_slots;

        return $this->view('pages.new-appointment-step2')->viewdata(array('model' => $model))->title('New Appointment');

    }

    function get_split_into_slots($starttime, $endtime, &$slots)
    {
        $start_time = strtotime($starttime);
        $end_time = strtotime($endtime);
        while ($start_time <= $end_time) {
            //add date as a key in first level array
            if (!array_key_exists(date("H:i", $start_time), $slots)) {
                $slots[] = date("H:i", $start_time);
            }
             $start_time += 300;
        }

    }

}
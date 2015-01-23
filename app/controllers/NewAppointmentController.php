<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:30 PM
 */
namespace Scheduler\Controllers;


use Illuminate\Support\Facades\Request;
use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\FacilitiesRepository;
use Scheduler\Repository\SchedulerLogRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\VisitTypeRepository;
use Scheduler\Repository\ProviderRepository;
use Whoops\Example\Exception;

require_once app_path()."/models/viewModels/SchedulerViewModel.php";
require_once app_path()."/models/viewModels/NewAppointmentViewModel.php";



class NewAppointmentController extends  BaseController{

    protected $providerRepo;
    public function  __construct(UserRepository $userRepo,
                                 ShibbolethRepository $shibb,
                                 AppointmentRepository $apptRepo,FacilitiesRepository $facilitiesRepo,
                                 VisitTypeRepository $visitTypeRepo,
                                 SchedulerLogRepository $schedulerLogRepo,ProviderRepository $providerRepo){

        parent::__construct($userRepo,$shibb,$apptRepo,$facilitiesRepo,$visitTypeRepo,$schedulerLogRepo);
        $this->providerRepo=$providerRepo;

    }

    /**
     * Function to create new appointment.
     */

    public function getIndex(){
        $model = new \NewAppointmentViewModel();

        //TODO:read from Laravel route
        $model->selectedFacility = \Filter::filterInput(INPUT_GET,'facility',
            FILTER_SANITIZE_SPECIAL_CHARS|FILTER_SANITIZE_ENCODED);
        $model->selectedvisitType=\Filter::filterInput(INPUT_GET,'visitType',
            FILTER_SANITIZE_SPECIAL_CHARS|FILTER_SANITIZE_ENCODED);


        $model->visitTypes = $this->visitTypeRepo->getAllVisitTypes();
        $model->facilities=$this->facilitiesRepo->getAllFacilities();


        return $this->view('pages.new-appointment-step1')->viewdata(array('model'=>$model))->title('New Appointment');


    }

    /**
     * Schedule Function
     * @return mixed
     */
    public function schedule(){

        //step 1- save the values in the database
        // load the values;
        $visitType = \Filter::filterInput(INPUT_POST,'visitType',
            FILTER_SANITIZE_SPECIAL_CHARS|FILTER_SANITIZE_ENCODED);

        $facility=\Filter::filterInput(INPUT_POST,'facility',
            FILTER_SANITIZE_SPECIAL_CHARS|FILTER_SANITIZE_ENCODED);


        $model = new \SchedulerViewModel();
        $model->providers=$this->providerRepo->getAllProviders();
        $model->selectedProvider = $model->providers[0]->Id;
        $model->visitType= $visitType;

        $this->apptRepo->getAllAvailableAppointments($model->selectedProvider,date('Y-m-d'));

        return $this->view('pages.new-appointment-step2')->viewdata(array('model'=>$model))->title('New Appointment -
         Step 2');
    }

    public function scheduleSave(){

    }

}
<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/3/15
 * Time: 9:28 AM
 */

namespace Scheduler\Controllers;


use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\FacilitiesRepository;
use Scheduler\Repository\SchedulerLogRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\VisitTypeRepository;
use Scheduler\Repository\PatientRepository;


class SettingsController extends BaseController{

    protected $patientRepo;

    public function  __construct(UserRepository $userRepo,
                                 ShibbolethRepository $shibb,
                                 AppointmentRepository $apptRepo, FacilitiesRepository $facilitiesRepo,
                                 VisitTypeRepository $visitTypeRepos,SchedulerLogRepository $schedulerLogRepo,PatientRepository $patientRepo)
    {
        parent::__construct($userRepo, $shibb, $apptRepo, $facilitiesRepo, $visitTypeRepos,$schedulerLogRepo);

        $this->patientRepo=$patientRepo;
    }


    public function getIndex(){

        $text_enabled = $this->patientRepo->getTextEnabledValue($this->getUniversityId());
        $checked = ($text_enabled==1)?"true":"";

        return $this->view('pages.settings')->viewdata(array('textenabled'
        =>$text_enabled,"checked"=>$checked))->title('Settings');

    }

    public function save(){
       $textEnabled = \Input::get('textEnabled');

       $this->patientRepo->updateTextEnabledValue($this->getUniversityId(),($textEnabled=="true")?1:0);
       return \Redirect::action('SettingsController@getIndex');

    }


}
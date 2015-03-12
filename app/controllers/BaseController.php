<?php

namespace Scheduler\Controllers;

use Illuminate\Routing\Controllers\Controller;
use Illuminate\Support\Facades\View;

use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\SchedulerLogRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\FacilitiesRepository;
use Scheduler\Repository\VisitTypeRepository;

require_once app_path().'/models/Filter.php';
require_once app_path()."/helpers/EmailService.php";


abstract class BaseController extends Controller {

    protected $shibboleth;
    protected $userRepo;
    protected $apptRepo;
    protected $facilitiesRepo;
    protected $visitTypeRepo;
    public $schedulerLogRepo;
    protected $patientRepo;
    protected $providerRepo;
    protected $user_profile;
    protected $emailService;
    protected $app;

    // view - to render
    protected $view;
    protected $layout = 'layouts.master';

    // data to be passed to the view
    protected $data;

    // subview
    protected  $subview;

    //data to be passed to the subview
    protected $subdata = array();

    //view title
    protected $title = array();

    protected $header_title;
    protected $lang;

    public function __construct($app,$sublayout = null){

        global $LANG;
        $this->app = $app;



        $this->shibboleth=$app->ShibbolethRepository;
        $this->userRepo = $app->UserRepository;
        $this->apptRepo=$app->AppointmentRepository;
        $this->facilitiesRepo=$app->FacilitiesRepository;
        $this->visitTypeRepo=$app->VisitTypeRepository;
        $this->schedulerLogRepo=$app->SchedulerLogRepository;
        $this->patientRepo=$app->PatientRepository;
        $this->providerRepo = $app->ProviderRepository;

        $this->emailService = new \EmailService();

        $this->view = $sublayout;

        $this->lang = $LANG;

        $sessionId=$this->getUserSessionId();


        $CI=$this;
        //Before every request - check the scheduler log and clear it.
       $this->beforeFilter(function()use($CI){
            $CI->schedulerLogRepo->clearAllPreviousSessions();
        });


        $this->user_profile=$this->getUserProfile();


        // Layout - pass data for the partial views in the layout
        View::share(array('profile'=> $this->user_profile));
        View::share(array('header_title'=>$this->header_title));




    }


    /**
     * Set subview
     * @param $subview
     * @return $this
     */
    protected function subview($subview)
    {
        $this->subview = $subview;
        return $this;
    }

    /**
     * Set data to pass to subview
     * @param array $subdata
     * @return self
     */
    protected function subdata(array $subdata)
    {
        $this->subdata = $subdata;
        return $this;
    }

    protected function viewdata($data)
    {
        $this->data = $data;
        return $this;
    }

    private function rendersubview()
    {
        $this->subview = array('subview' => View::make($this->subview)->with($this->subdata));

        return $this->data = $this->data + $this->subview;
    }


    protected function title($title)
    {
        View::share(array('title'=>$title));
        return $this->render();
    }




    private function render()
    {
       // render subview if subview is passed
        (is_null($this->subview)) ? : $this->rendersubview();

        // render the view
        return View::make($this->layout)
             ->nest('content', $this->view, $this->data);

    }

    protected  function view($layoutName){
        $this->view= $layoutName;
        return $this;

    }

    protected function  getUniversityId()
    {
       return  $this->shibboleth->getUserUniversityId();

    }

    protected function getUserProfile(){
        $univ = $this->getUniversityId();

        $user = $this->userRepo->getUserProfile($univ);

        return $user;


    }

    protected function getUserSessionId()
    {
        if (isset($_SERVER['Shib-Session-ID'])) {
            return $_SERVER['Shib-Session-ID'];
        }
        //reading laravel session cookie - TEMP will remove;
        $val= explode('=',$_SERVER['HTTP_COOKIE']);
        return $val[1];
    }


    public function success($message)
    {
        View::share(array('message'=>$message));

    }


}
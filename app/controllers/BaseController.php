<?php

namespace Scheduler\Controllers;

use Illuminate\Routing\Controllers\Controller;
use Illuminate\Support\Facades\View;

require_once app_path() . '/models/Filter.php';

require_once app_path() . "/helpers/CASHelper.php";


abstract class BaseController extends Controller
{
//test
    protected $ldap;
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
    protected $subview;

    //data to be passed to the subview
    protected $subdata = array();

    //view title
    protected $title = array();

    protected $header_title;
    protected $lang;

    public function __construct($app, $sublayout = null)
    {

        $CI = $this;



        global $LANG;
        $this->app = $app;


        $this->ldap = $app->LDAPService;
        $this->userRepo = $app->UserRepository;
        $this->apptRepo = $app->AppointmentRepository;
        $this->facilitiesRepo = $app->FacilitiesRepository;
        $this->visitTypeRepo = $app->VisitTypeRepository;
        $this->schedulerLogRepo = $app->SchedulerLogRepository;
        $this->patientRepo = $app->PatientRepository;
        $this->providerRepo = $app->ProviderRepository;

        $this->view = $sublayout;

        $this->lang = $LANG;



        //Before every request - check the scheduler log and clear it.
        $this->beforeFilter(function () use ($CI) {

            $CI->schedulerLogRepo->clearAllPreviousSessions();
        });


        $this->user_profile = $this->getUserProfile();



        // Layout - pass data for the partial views in the layout
        View::share(array('profile' => $this->user_profile));
        View::share(array('header_title' => $this->header_title));


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
        View::share(array('title' => $title));
        return $this->render();
    }


    private function render()
    {
        // render subview if subview is passed
        (is_null($this->subview)) ?: $this->rendersubview();

        // render the view
        return View::make($this->layout)
            ->nest('content', $this->view, $this->data);

    }

    protected function view($layoutName)
    {
        $this->view = $layoutName;
        return $this;

    }

    protected function  getUniversityId()
    {
        $network_id= $this->getUserId();
        if(stripos('uisoscan',$network_id)!==false)
            return $this->__byPassUISOScan();


        return $this->ldap->getUserUniversityId($network_id);

    }


    protected function  getPersonAffiliation()
    {

       return ($this->ldap->getUserAffiliations($this->getUserId()));

    }

    protected function getUserProfile()
    {
        $univ = $this->getUniversityId();

        $user = $this->userRepo->getUserProfile($univ);

        return $user;

    }

    /** Function to return networkId */
    protected function getUserId()
    {
        return $_SESSION['user'];

        //return 'hussaint';
    }


    public function success($message)
    {
        View::share(array('message' => $message));

    }

    protected function getUserSessionId(){
        return session_id();

    }


    /* For the purpose of scan */
    protected function __byPassUISOScan(){
        return '317550';
    }
}
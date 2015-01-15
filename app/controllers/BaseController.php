<?php

namespace Scheduler\Controllers;
use Illuminate\Routing\Controllers\Controller;
use Illuminate\Support\Facades\View;

use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\UserRepository;

abstract class BaseController extends Controller {

    protected $shibboleth;
    protected $userRepo;
    protected $apptRepo;

    // view - to render
    protected $view;
    protected $layout = 'layouts.master';

    // data to be passed to the view
    protected $data = array();

    // subview
    protected  $subview;

    //data to be passed to the subview
    protected $subdata = array();

    //view title
    protected $title = array();

    public function __construct(UserRepository $userRepo,
                                ShibbolethRepository $shibb,AppointmentRepository $apptRepo,
                                $sublayout = null){

        $this->shibboleth=$shibb;
        $this->userRepo = $userRepo;
        $this->apptRepo=$apptRepo;
        $this->view = $sublayout;

        // Layout - pass data for the partial views in the layout
        View::share(array('profile'=>$this->getUserProfile()));

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

    protected function viewdata(array $data)
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
        $this->title = $title;
       return $this->render();
    }


    private function render()
    {
       // render subview if subview is passed
        (is_null($this->subview)) ? : $this->rendersubview();

        // render the view
        return View::make($this->layout)
             ->nest('content', $this->view, $this->data)
             ->with('title', $this->title);
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


}
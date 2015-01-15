<?php
namespace Scheduler\Controllers;

use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;

class HomeController extends BaseController {

	/*
	|--------------------------------------------------------------------------
	| Default Home Controller
	|--------------------------------------------------------------------------
	|
	| You may wish to use controllers instead of, or in addition to, Closure
	| based routes. That's great! Here is an example controller method to
	| get you started. To route to this controller, just add the route:
	|
	|	Route::get('/', 'HomeController@showWelcome');
	|
	*/

    public function  __construct(UserRepository $userRepo,
                                 ShibbolethRepository $shibb,AppointmentRepository $apptRepo){
        parent::__construct($userRepo,$shibb,$apptRepo);
    }


    public function getIndex()
    {
        $appointment_lists = array(
            'pastappts'=>$this->apptRepo->getAllPreviousAppointments($this->getUniversityId())
        );

        return $this->view('pages.home')->viewdata($appointment_lists)->title('Home');
    }


}
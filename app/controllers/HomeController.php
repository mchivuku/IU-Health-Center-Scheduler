<?php
namespace Scheduler\Controllers;

use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;
use Whoops\Example\Exception;

require_once app_path()."/models/viewModels/IndexViewModel.php";
require_once app_path()."/models/viewModels/TableListViewModel.php";
require_once app_path()."/models/ClientSideDataTableFunctionModel.php";


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
                                 ShibbolethRepository $shibb,
                                 AppointmentRepository $apptRepo){
        parent::__construct($userRepo,$shibb,$apptRepo);
    }


    public function getIndex()
    {
        try{
            $univId = $this->getUniversityId();
            $model = new \IndexViewModel();
            $model->nextAppointment=$this->apptRepo->getNextAppointment($univId);

            $x= new \TableListViewModel();
            $x->header = array('Date','Visit Type','Facility','Provider');
            $x->sortColumnsClasses=array(\SortClass::Date,\SortClass::String,\SortClass::String,\SortClass::String);

            $appts=$this->apptRepo->getAllPreviousAppointments($univId);
            array_walk($appts, function($item)use(&$x){

                $x->data[]= array($item->getAppointmentDate(),$item->visitType,
                    $item->facility,$item->getProviderName()

                );

            });
            $model->pastAppointmentListViewModel=$x;

            return $this->view('pages.home')->viewdata(array('model'=>$model))->title('Home');
        }catch (Exception $e){
            var_dump($e->getMessage());
        }

    }


}
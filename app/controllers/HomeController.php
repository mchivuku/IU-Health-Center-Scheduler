<?php
namespace Scheduler\Controllers;

use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\FacilitiesRepository;
use Scheduler\Repository\SchedulerLogRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\VisitTypeRepository;
use Whoops\Example\Exception;

require_once app_path() . "/models/viewModels/IndexViewModel.php";
require_once app_path() . "/models/viewModels/TableListViewModel.php";
require_once app_path() . "/models/ClientSideDataTableFunctionModel.php";


class HomeController extends BaseController
{

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
                                 AppointmentRepository $apptRepo, FacilitiesRepository $facilitiesRepo,
                                 VisitTypeRepository $visitTypeRepos,SchedulerLogRepository $schedulerLogRepo)
    {
        parent::__construct($userRepo, $shibb, $apptRepo, $facilitiesRepo, $visitTypeRepos,$schedulerLogRepo);
    }


    public function getIndex()
    {
        try {
            $univId = $this->getUniversityId();
            $model = new \IndexViewModel();
            $model->nextAppointment = $this->apptRepo->getNextAppointment($univId);

            $x = new \TableListViewModel();
            $x->header = array('Date', 'Visit Type', 'Facility', 'Provider', '&nbsp;');
            $x->sortColumnsClasses = array(\SortClass::Date, \SortClass::String, \SortClass::String,
                \SortClass::String,\SortClass::NoSort);

            $appts = $this->apptRepo->getAllPreviousAppointments($univId);
            array_walk($appts, function ($item) use (&$x) {

                //TODO - fix this
                $last_column = "<span class='tablesaw-cell-content'><a href='#'>More Information</a><a ".
                               "href='#'>Schedule Again</a></span>";

                $x->data[] = array($item->getAppointmentDate(), $item->visitType,
                    $item->facility, $item->getProviderName(),
                    $last_column

                );

            });
            $model->pastAppointmentListViewModel = $x;

            return $this->view('pages.home')->viewdata(array('model' => $model))->title('Home');
        } catch (Exception $e) {
            var_dump($e->getMessage());
        }

    }


}
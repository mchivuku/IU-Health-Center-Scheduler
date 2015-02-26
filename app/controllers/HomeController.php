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
    protected $header_title = array('label'=>'IU Health Center Appointments','text'=>'Schedule an appointment or get information about appointments you have already scheduled.');


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

    public function  __construct($app)
    {
        parent::__construct($app);
    }


    public function getIndex()
    {

            $univId = $this->getUniversityId();
            $model = new \IndexViewModel();
            $model->nextAppointment = $this->apptRepo->getNextAppointment($univId);

            $x = new \TableListViewModel();
            $x->header = array('Date','Time','Visit Type', 'Facility', 'Provider', '&nbsp;');
            $x->sortColumnsClasses = array(\SortClass::Date, \SortClass::String,\SortClass::String, \SortClass::String,
                \SortClass::String,\SortClass::NoSort);

            $appts = $this->apptRepo->getAllPreviousAppointments($univId);
            array_walk($appts, function ($item) use (&$x) {

                $today = strtotime(date('Y-m-d H:i:s'));
                $combined_date_and_time = $item->date . ' ' . $item->startTime;
                $appt_date_time = strtotime($combined_date_and_time);

                $last_column="";
                // Cancellation - appointments - only future
                if($appt_date_time > $today){

                    $link = link_to_action('HomeController@cancelAppointment', 'Cancel Appointment',
                        array(
                        'encId' => $item->encId));

                    $last_column = "<span class='tablesaw-cell-content'><a href='#'>More Information</a>".$link
                        ."</span>";

                }
                else{
                    $last_column = "<span class='tablesaw-cell-content'><a href='#'>More Information</a><a ".
                        "href='#'>Schedule Again</a></span>";
                }
                $x->data[] = array(date('Y-m-d',strtotime($item->date)),
                    '<span title="'. date('H:i',strtotime($item->startTime)).'"></span>'.$item->getStart(),
                    $item->visitType,
                    $item->facility, $item->getProviderName(),
                    $last_column

                );

            });
            $model->pastAppointmentListViewModel = $x;

            return $this->view('pages.home')->viewdata(array('model' => $model))->title('Home');


    }

    /***
     * Function to cancel Appointment
     */

    public function cancelAppointment(){

          $encId   = \Input::get('encId');

          //Cancel Appointment
          $this->apptRepo->cancelAppointment($encId);
           $this->success('Appointment has been cancelled successfully');
          return \Redirect::action('HomeController@getIndex');
    }


}
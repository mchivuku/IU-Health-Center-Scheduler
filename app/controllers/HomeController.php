<?php
namespace Scheduler\Controllers;

use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\FacilitiesRepository;
use Scheduler\Repository\SchedulerLogRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;
use Scheduler\Repository\VisitTypeRepository;


require_once app_path() . "/models/viewModels/IndexViewModel.php";
require_once app_path() . "/models/viewModels/TableListViewModel.php";
require_once app_path() . "/models/ClientSideDataTableFunctionModel.php";


class HomeController extends BaseController
{
    protected $header_title = array('label' => 'IU Health Center Appointments', 'text' => 'Schedule an appointment or get information about appointments you have already scheduled.');


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
        $x->header = array('Date', 'Time', 'Visit Type', 'Facility', 'Provider', '&nbsp;');
        $x->sortColumnsClasses = array(\SortClass::Date, \SortClass::String, \SortClass::String, \SortClass::String,
            \SortClass::String, \SortClass::NoSort);

        $appts = $this->apptRepo->getAllPreviousAppointments($univId);
        array_walk($appts, function ($item) use (&$x) {

            $today = strtotime(date('Y-m-d H:i:s'));
            $combined_date_and_time = $item->date . ' ' . $item->startTime;
            $appt_date_time = strtotime($combined_date_and_time);


            $more_link = link_to_action('HomeController@getMoreInformation', 'More Information',
                array(
                    'encId' => $item->encId), array('data-reveal-id' => "more-info", 'id' => 'more-info-link'));

            $last_column = "";
            // Cancellation - appointments - only future
            if ($appt_date_time > $today) {

                $link = link_to_action('HomeController@confirmCancellation', 'Cancel Appointment',
                    array(
                        'encId' => $item->encId), array('data-reveal-id' => "more-info", 'id' => 'cancel-appt-link'));

                $last_column = "<span class='tablesaw-cell-content'>" . $more_link . $link
                    . "</span>";

            } else {

                $params = array('facility' => $item->facilityId, 'visitType' => $item->visitTypeId);
                $queryString = http_build_query($params);
                $schedule_again_link = \URL::to(action('NewAppointmentController@getIndex') . '?' . $queryString);


                $last_column = "<span class='tablesaw-cell-content'>" . $more_link . "<a
                                href='$schedule_again_link'>Schedule Again</span>";
            }
            $x->data[] = array(date('Y-m-d', strtotime($item->date)),
                '<span title="' . date('H:i', strtotime($item->startTime)) . '"></span>' . $item->getStart(),
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
    public function confirmCancellation()
    {
        $encId = \Input::get('encId');
        return \View::make('includes.cancel-appointment', array('encId' => $encId));;
    }


    /***
     * Function to cancel Appointment
     */
    public function cancelAppointment()
    {

        $inputs = \Input::all();
        $encId = $inputs['encId'];
        //Cancel Appointment
        $this->apptRepo->cancelAppointment($encId);
        return \Redirect::action('HomeController@getIndex');
    }

    /***
     * Function to cancel Appointment
     */
    public function getMoreInformation()
    {

        $encId = \Input::get('encId');
        $email_template = $this->apptRepo->getEmailTemplateForAppointment($encId);

        // More Information from database;
        return \View::make('includes.more-information', array('info' => $email_template));
    }

    // CAS LOGOUT
    public function logout()
    {

        // clear all the session user has created
        $this->schedulerLogRepo->clearSessionData($this->getUserSessionId());

        // Clear all cookies
        if (isset($_SERVER['HTTP_COOKIE'])) {
            $cookies = explode(';', $_SERVER['HTTP_COOKIE']);

            foreach ($cookies as $cookie) {
                $parts = explode('=', $cookie);
                $name = trim($parts[0]);
                setcookie($name, '', time() - 1000);
                \Cookie::forget($name);
            }
        }
        session_destroy();
        return \Redirect::to("https://cas.iu.edu/cas/logout");
    }

}
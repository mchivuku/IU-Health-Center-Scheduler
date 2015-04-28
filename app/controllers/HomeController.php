<?php
namespace Scheduler\Controllers;


use Whoops\Example\Exception;

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

        $path = app_path() . "/config/cancellationEmail.txt";

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

            // Showing Cancel Appointment - Link
            $date_a = new \DateTime(date('Y-m-d H:i:s'));
            $date_b = new \DateTime($item->date . ' ' . $item->startTime);

            $interval = date_diff($date_b, $date_a);
            $minutes = $interval->days * 24 * 60;
            $minutes += $interval->h * 60;
            $minutes += $interval->i;

            $last_column = "";
            // Cancellation - appointments - only future that have atleast 60mins
            if ($date_b >= $date_a && $minutes >= ALLOW_CANCELLATION_UNTIL_TIME) {

                $link = link_to_action('HomeController@confirmCancellation', 'Cancel Appointment',
                    array(
                        'encId' => $item->encId), array('data-reveal-id' => "more-info", 'id' => 'cancel-appt-link'));

                $last_column = "<span class='tablesaw-cell-content'>" .  $link
                    . "</span>";

            } else {

                $params = array('facility' => $item->facilityId, 'visitType' => $item->visitTypeId);
                $queryString = http_build_query($params);
                $schedule_again_link = \URL::to(action('NewAppointmentController@getIndex') . '?' . $queryString);


                $last_column = "<span class='tablesaw-cell-content'>" . "<a
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
        return \View::make('includes.cancel-appointment', array('encId' => $encId));
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

        $appt_date_time = $this->apptRepo->getAppointment($encId);

        $path = app_path() . "/config/cancellationEmail.txt";

        if (file_exists($path) && ($this->user_profile->email) != "") {
            $message = file_get_contents($path, FILE_USE_INCLUDE_PATH);

            $app_date_time = date_format(new \Datetime($appt_date_time->date . " " .
                    $appt_date_time->startTime),
                'd/m/y  g:i a');



            $x = str_replace('%date%', $app_date_time, $message);

            //send cancellation email
            $this->emailService->send(array('name' => $this->user_profile->getName(),
                'email' => $this->user_profile->email, 'message' => $x,
                'subject' => $this->lang['Cancellation_Email_Subject']));

        }

        return \Redirect::action('HomeController@getIndex');
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
        session_unset();
        session_destroy();
        return \Redirect::to("https://cas.iu.edu/cas/logout");
    }


}
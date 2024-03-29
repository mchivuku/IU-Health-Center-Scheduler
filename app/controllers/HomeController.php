<?php
namespace Scheduler\Controllers;


use Whoops\Example\Exception;

ini_set('display_errors',1);

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

            if ($date_b >= $date_a && $minutes >= \Config::get('settings.allow_cancellation_until_time')) {

                $link = link_to_action('HomeController@confirmCancellation', 'Cancel Appointment',
                    array(
                        'encId' => $item->encId), array('data-reveal-id' => "more-info",
                        'id' => 'cancel-appt-link'));
                $last_column =  $link;
            } else {

                $params = array('facility' => $item->facilityId, 'visitType' => $item->visitTypeId);
                $queryString = http_build_query($params);
                $schedule_again_link = \URL::to(action('NewAppointmentController@getIndex') . '?' . $queryString);

                $last_column =  "<a
                                href='$schedule_again_link'>Schedule Again</a>";
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

        if (($this->user_profile->email) != ""){


            //time format
            $hours = date('H', strtotime($appt_date_time->startTime));
            $ext = ($hours < 12) ? 'a.m.' : 'p.m.';
            $time_display = date('g:i',
                    strtotime($appt_date_time->startTime)) . " " . $ext;


            $app_date_time = date_format(
                new \Datetime($appt_date_time->date),
                'm/d/y') ." at " .  $time_display;


            $email = $this->user_profile->email;
            $name = $this->user_profile->getName();
            $subject =$this->lang['Cancellation_Email_Subject'];

            \Mail::send('emails.cancellation', array("date"=>$app_date_time), function($message)use($email,$name,$subject)
            {
                $message->to($email, $name)->subject($subject);
            });

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
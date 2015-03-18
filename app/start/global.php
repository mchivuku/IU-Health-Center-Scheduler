<?php

/*
|--------------------------------------------------------------------------
| Register The Laravel Class Loader
|--------------------------------------------------------------------------
|
| In addition to using Composer, you may use the Laravel class loader to
| load your controllers and models. This is useful for keeping all of
| your classes in the "global" namespace without Composer updating.
|
*/


ClassLoader::addDirectories(array(
    app_path() . '/commands',
    app_path() . '/controllers',
    app_path() . '/models',
    app_path() . '/database/seeds',
    app_path() . '/repository',
    app_path() . '/providers',

));

/*
|--------------------------------------------------------------------------
| Application Error Logger
|--------------------------------------------------------------------------
|
| Here we will configure the error logger setup for the application which
| is built on top of the wonderful Monolog library. By default we will
| build a rotating log file setup which creates a new file each day.
|
*/


$logFile = 'log-' . php_sapi_name() . '.txt';
Log::useDailyFiles(storage_path() . '/logs/' . $logFile);


/*
|--------------------------------------------------------------------------
| Application Error Handler
|--------------------------------------------------------------------------
|
| Here you may handle any errors that occur in your application, including
| logging them or displaying custom views for specific errors. You may
| even register several error handlers to handle different types of
| exceptions. If nothing is returned, the default error view is
| shown, which includes a detailed stack trace during debug.
|
*/

App::error(function (Exception $exception, $code) {


    Log::error($exception);

    $header_title = array('label' => 'IU Health Center Appointments',
        'text' => 'Schedule an appointment or get information about appointments you have already scheduled.');

    if (Config::get('app.debug') == false) {
        switch ($code) {
            case 403:
                View::share(array('title' => 'Un Authorized', 'header_title' => $header_title));
                return Response::view('errors.403', array(), 403);

            case 404:
                View::share(array('title' => 'Not Found', 'header_title' => $header_title));
                return Response::view('errors.404', array(), 404);

            case 500:
                View::share(array('title' => 'Exception', 'header_title' => $header_title));
                return Response::view('errors.500', array(), 500);

            default:
                View::share(array('title' => 'Error', 'header_title' => $header_title));
                return Response::view('errors.default', array(), $code);

        }
    }


});

/*
|--------------------------------------------------------------------------
| Maintenance Mode Handler
|--------------------------------------------------------------------------
|
| The "down" Artisan command gives you the ability to put an application
| into maintenance mode. Here, you will define what is displayed back
| to the user if maintenace mode is in effect for this application.
|
*/

App::down(function () {
    return Response::make("Be right back!", 503);
});


/*
|--------------------------------------------------------------------------
| Require The Filters File
|--------------------------------------------------------------------------
|
| Next we will load the filters file for the application. This gives us
| a nice separate location to store our route and application filter
| definitions instead of putting them all in the main routes file.
|

App::Before(function($request){

    if( isset($_SESSION['LAST_REQUEST']) &&
        (time() - $_SESSION['LAST_REQUEST'] > SESSION_ACTIVITY_TIME) ) {

        header('/newAppointment/clearsession');
        exit();
    }

    $_SESSION['LAST_REQUEST'] = time();
});
*/


require app_path() . '/filters.php';
include app_path() . '/helpers/HtmlBuilderExtensions.php';
include app_path() . '/helpers/FormBuilderExtensions.php';
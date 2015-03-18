<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/
use Scheduler\Controllers;


Route::get('/', array(
    'as' => 'home',
    'uses' => 'HomeController@getIndex'
));


Route::get('/confirmCancellation', array(
    'as' => 'confirmCancellation',
    'uses' => 'HomeController@confirmCancellation'
));


Route::post('/cancelAppointment', array(
    'as' => 'cancelAppointment',
    'uses' => 'HomeController@cancelAppointment'
));

Route::get('/logout', array(
    'as' => 'logout',
    'uses' => 'HomeController@logout'
));


Route::get('/getMoreInformation', array(
    'as' => 'getMoreInformation',
    'uses' => 'HomeController@getMoreInformation'
));

Route::get('/serverdump', function () {
    echo "<pre>";
    print_r($_SERVER);
});


Route::group(array('prefix' => 'settings'), function () {

    Route::get('/', array(
        'as' => 'settings',
        'uses' => 'SettingsController@getIndex'
    ));

    Route::get('/save', array(
        'as' => 'settings.save',
        'uses' => 'SettingsController@save'
    ));

});

//TODO - route grouping
Route::group(array('prefix' => 'newAppointment'), function () {

    Route::get('/schedule', array(
        'as' => 'newAppointment.schedule',
        'uses' => 'NewAppointmentController@schedule'
    ));

    Route::post('/scheduleSave', array(
        'as' => 'newAppointment.save',
        'uses' => 'NewAppointmentController@scheduleSave'
    ));

    Route::get('/getTimes', array(
        'as' => 'newAppointment.getTimes',
        'uses' => 'NewAppointmentController@getTimes'
    ));

    Route::get('/getVisitTypes',
        array(
            'as' => 'newAppointment.visitType',
            'uses' => 'NewAppointmentController@getVisitTypes'
        ));

    Route::get('/getAvailableTimes',
        array(
            'as' => 'newAppointment.availableTimes',
            'uses' => 'NewAppointmentController@getAvailableTimes'
        ));

    Route::get('/getAvailableDates',
        array(
            'as' => 'newAppointment.availableDate',
            'uses' => 'NewAppointmentController@getAvailableDates'
        ));


    Route::get('/saveSelectedTime',
        array(
            'as' => 'newAppointment.saveSelectedTime',
            'uses' => 'NewAppointmentController@saveSelectedTime'
        ));

    Route::post('/scheduleConfirm',
        array(
            'as' => 'newAppointment.finish',
            'uses' => 'NewAppointmentController@scheduleConfirm'
        ));

    Route::get('/clearsession',
        array(
            'as' => 'newAppointment.clearsession',
            'uses' => 'NewAppointmentController@clearsession'
        ));

    Route::post('/scheduleSave',
        array(
            'as' => 'newAppointment.scheduleSave',
            'uses' => 'NewAppointmentController@scheduleSave'
        ));

    Route::get('/{facility?}{visitType?}',
        array(
            'as' => 'newAppointment.index',
            'uses' => 'NewAppointmentController@getIndex'
        ));


});











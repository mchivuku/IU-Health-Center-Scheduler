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


Route::group(array('prefix' => 'settings'), function() {

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
Route::group(array('prefix' => 'newAppointment'), function(){

    Route::get('/schedule', array(
        'as' => 'newAppointment.schedule',
        'uses' => 'NewAppointmentController@schedule'
    ));

    Route::post('/scheduleSave', array(
        'as' => 'newAppointment.save',
        'uses' => 'NewAppointmentController@scheduleSave'
    ));

    Route::get( '/getTimes', array(
        'as' => 'newAppointment.getTimes',
        'uses' => 'NewAppointmentController@getTimes'
    ) );

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


    Route::get('/{facility?}{visitType?}',
        array(
            'as' => 'newAppointment.index',
            'uses' => 'NewAppointmentController@getIndex'
        ));



});













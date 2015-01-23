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

 //TODO - route grouping

Route::group(array('prefix' => 'newAppointment'), function(){

    Route::post('/schedule', array(
        'as' => 'newAppointmentSchedule',
        'uses' => 'NewAppointmentController@schedule'
    ));

    Route::post('/scheduleSave', array(
        'as' => 'newAppointmentSave',
        'uses' => 'NewAppointmentController@scheduleSave'
    ));

    Route::get('/{facility?}{visitType?}',
        array(
            'as' => 'newAppointment',
            'uses' => 'NewAppointmentController@getIndex'
        ));






});












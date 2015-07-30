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


Route::get('/', array( 'before' => 'auth.basic',
    'as' => 'home',
    'uses' => 'HomeController@getIndex'
));


Route::get('/confirmCancellation', array('before' => 'auth.basic',
    'as' => 'confirmCancellation',
    'uses' => 'HomeController@confirmCancellation'
));


Route::get('/policies', array('before' => 'auth.basic',
    'as' => 'policies',
    'uses' => 'PoliciesController@getIndex'
));


Route::post('/cancelAppointment', array('before' => 'auth.basic',
    'as' => 'cancelAppointment',
    'uses' => 'HomeController@cancelAppointment'
));

Route::get('/logout', array('before' => 'auth.basic',
    'as' => 'logout',
    'uses' => 'HomeController@logout'
));


Route::get('/getMoreInformation', array('before' => 'auth.basic',
    'as' => 'getMoreInformation',
    'uses' => 'HomeController@getMoreInformation'
));

Route::get('/serverdump', function () {
    echo "<pre>";
    print_r($_SERVER);
});


Route::group(array('prefix' => 'settings'), function () {

    Route::get('/', array('before' => 'auth.basic',
        'as' => 'settings',
        'uses' => 'SettingsController@getIndex'
    ));

    Route::get('/save', array('before' => 'auth.basic',
        'as' => 'settings.save',
        'uses' => 'SettingsController@save'
    ));

});

Route::group(array('prefix' => 'newAppointment'), function () {

    Route::get('/schedule', array('before' => 'auth.basic',
        'as' => 'newAppointment.schedule',
        'uses' => 'NewAppointmentController@schedule'
    ));

    Route::post('/scheduleSave', array('before' => 'auth.basic',
        'as' => 'newAppointment.save',
        'uses' => 'NewAppointmentController@scheduleSave'
    ));

    Route::get('/getTimes', array('before' => 'auth.basic',
        'as' => 'newAppointment.getTimes',
        'uses' => 'NewAppointmentController@getTimes'
    ));

    Route::get('/getVisitTypes',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.visitType',
            'uses' => 'NewAppointmentController@getVisitTypes'
        ));

    Route::get('/getAvailableTimes',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.availableTimes',
            'uses' => 'NewAppointmentController@getAvailableTimes'
        ));

    Route::get('/getAvailableDates',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.availableDate',
            'uses' => 'NewAppointmentController@getAvailableDates'
        ));


    Route::get('/saveSelectedTime',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.saveSelectedTime',
            'uses' => 'NewAppointmentController@saveSelectedTime'
        ));

    Route::post('/scheduleConfirm',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.finish',
            'uses' => 'NewAppointmentController@scheduleConfirm'
        ));

    Route::get('/clearsession',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.clearsession',
            'uses' => 'NewAppointmentController@clearsession'
        ));

    Route::post('/scheduleSave',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.scheduleSave',
            'uses' => 'NewAppointmentController@scheduleSave'
        ));

    Route::get('/{facility?}{visitType?}',
        array('before' => 'auth.basic',
            'as' => 'newAppointment.index',
            'uses' => 'NewAppointmentController@getIndex'
        ));


});

Route::filter('auth.basic', function()
{
    CASAuthenticate::logon();

});











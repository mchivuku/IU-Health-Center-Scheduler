<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 4/20/15
 * Time: 4:50 PM
 */
namespace Scheduler\Controllers;

/**
 * Class PoliciesController
 * @package Scheduler\Controllers
 */
class PoliciesController extends BaseController
{
    protected $header_title =
        array('label' => 'Policies',
            'text' =>
                'Important information about our appointment policies.');


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
        return \View::make('pages.policies',array('title' => 'Policies'));
    }

}
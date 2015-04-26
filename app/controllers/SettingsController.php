<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/3/15
 * Time: 9:28 AM
 */

namespace Scheduler\Controllers;

class SettingsController extends BaseController
{

    protected $patientRepo;
    protected $header_title = array('label' => 'Settings',
        'text' => 'Update your account settings.');


    public function  __construct($app)
    {
        parent::__construct($app);

    }

    public function getIndex()
    {

        $text_enabled_values = $this->patientRepo->getTextEnabledValue($this->getUniversityId());
        return $this->view('pages.settings')->viewdata(array('textenabled'
        => $text_enabled_values))->title('Settings');

    }

    public function save()
    {
        $textEnabled = \Input::get('textenabled');

        $this->patientRepo->updateTextEnabledValue($this->getUniversityId(),
            isset($textEnabled) ? 1 : 0);
        return   \Redirect::action('HomeController@getIndex');

    }

}
<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/3/15
 * Time: 9:28 AM
 */

namespace Scheduler\Controllers;

class SettingsController extends BaseController{

    protected $patientRepo;

    public function  __construct($app)
    {
        parent::__construct($app);

    }


    public function getIndex(){

        $text_enabled = $this->patientRepo->getTextEnabledValue($this->getUniversityId());
        $checked = ($text_enabled==1)?"true":"";

        return $this->view('pages.settings')->viewdata(array('textenabled'
        =>$text_enabled,"checked"=>$checked))->title('Settings');

    }

    public function save(){
       $textEnabled = \Input::get('textEnabled');

       $this->patientRepo->updateTextEnabledValue($this->getUniversityId(),($textEnabled=="true")?1:0);
       return \Redirect::action('SettingsController@getIndex');

    }


}
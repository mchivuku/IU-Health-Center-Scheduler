<?php

/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 2/11/15
 * Time: 4:37 PM
 */
class NewAppointmentBaseViewModel
{

    private $cssClass;

    public function getCssClass()
    {
        return isset($this->cssClass) ? $this->cssClass : '';
    }

    public function setCssClass($value)
    {
        $this->cssClass = $value;
    }
}
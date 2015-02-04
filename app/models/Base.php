<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/9/15
 * Time: 5:16 PM
 */


abstract class Base
{
    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }
    }

    public function __set($property, $value)
    {
        if (property_exists($this, $property)) {
            $this->$property = $value;
        }
    }

    public function formatName($lastName, $firstName)
    {
        return sprintf("%s,%s", $lastName, $firstName);
    }

    public function formatDate($input)
    {
        $date = date_create($input);
        return date_format($date,'m-d-Y');

    }

    public function formatDisplayTime($input){
        return date("g:i A.", $input);

    }

    public function formatSaveTime($input){
        return date("H:i:s", $input);

    }

}
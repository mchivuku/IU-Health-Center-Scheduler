<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 9:11 AM
 */
/*
 * Class contains functions filter and sanitize inputs
 *
 */

class Filter
{

    public function __construct()
    {

    }

    public static function filterInput($type, $variable_name, $filter, $default_value = null)
    {
        $return = filter_input($type, $variable_name, $filter);
        return (is_null($return) || $return === false) ? $default_value : $return;
    }


    public static function filterVar($variable, $filter, $default = null)
    {
        $return = filter_var($variable, $filter);
        return ($return === false) ? $default : $return;
    }

    public static function filterInputArray($type, Array $definition)
    {
        return filter_input_array($type, $definition);
    }


}

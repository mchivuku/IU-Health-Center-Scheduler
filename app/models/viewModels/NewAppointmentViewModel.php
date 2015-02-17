<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:53 PM
 */

require_once 'NewAppointmentBaseViewModel.php';

class NewAppointmentViewModel extends NewAppointmentBaseViewModel{

    public $facilities;
    public $visitTypes;

    public $selectedFacility;
    public $selectedvisitType;

}
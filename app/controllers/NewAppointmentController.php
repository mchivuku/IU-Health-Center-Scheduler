<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:30 PM
 */
namespace Scheduler\Controllers;


use Scheduler\Repository\AppointmentRepository;
use Scheduler\Repository\UserRepository;
use Scheduler\Repository\ShibbolethRepository;

require_once app_path()."/models/viewModels/IndexViewModel.php";
require_once app_path()."/models/viewModels/TableListViewModel.php";
require_once app_path()."/models/ClientSideDataTableFunctionModel.php";


class NewAppointmentController extends  BaseController{


    public function  __construct(UserRepository $userRepo,
                                 ShibbolethRepository $shibb,
                                 AppointmentRepository $apptRepo){
        parent::__construct($userRepo,$shibb,$apptRepo);
    }

    /**
     * Function to create new appointment.
     */

    public function getIndex($appointmentId){


    }

}
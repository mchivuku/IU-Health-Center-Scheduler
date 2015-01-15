<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:31 AM
 */

namespace Scheduler\Repository;

class PatientRepository{


    /***
     * Function to retrieve patient Id given university Id
     *
     * @param $universityId
     * @return mixed
     */
    public function getPatientId($universityId){

        $patient = \DB::table('patients')
            ->select(array('patients.pid patientId'
            ))
            ->where('patients.ControlNo', '=' ,$universityId)
            ->first();

        return $patient['patientId'];
    }

}
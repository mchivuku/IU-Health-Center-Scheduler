<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:31 AM
 */

namespace Scheduler\Repository;
/**
 * Class PatientRepository
 *
 * Patient repository contains methods utilities method that returns information from patients table.
 *
 * @package Scheduler\Repository
 */
class PatientRepository
{

    /***
     * Function to retrieve patient Id given university Id
     *
     * @param $universityId
     * @return mixed
     */
    public function getPatientId($universityId)
    {

        $patient = \DB::table('patients')
            ->select(array('pid as patientId'
            ))
            ->where('patients.ControlNo', '=', $universityId)
            ->first();
        return $patient->patientId;
    }


    /***
     * Function to return the current value of text-enabled field from the patients table
     * @param $universityId
     * @return mixed - array of text enabled value and iu-scheduler-textenabled field
     */
    public function getTextEnabledValue($universityId)
    {
        $patient = \DB::table('patients')
            ->select(array('textenabled','iu_scheduler_textenabled'
            ))
            ->where('patients.ControlNo', '=', $universityId)
            ->first();

        return $patient;
    }

    /***
     * Function that updates the value of textenabled value set by the user
     *
     * @param $universityId - university Id
     * @param $value - the value to update
     * $
     */
    public function updateTextEnabledValue($universityId, $value)
    {
        \DB::table('patients')
            ->where('patients.ControlNo', '=', $universityId)
            ->update(array('textenabled' => $value,'iu_scheduler_textenabled'=>$value));


    }

}
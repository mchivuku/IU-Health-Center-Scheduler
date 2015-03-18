<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/14/15
 * Time: 11:31 AM
 */

namespace Scheduler\Repository;

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
     * Function to return the current value of textenabled field in the patients table
     * @param $universityId
     * @return mixed
     */
    public function getTextEnabledValue($universityId)
    {
        $patient = \DB::table('patients')
            ->select(array('textenabled'
            ))
            ->where('patients.ControlNo', '=', $universityId)
            ->first();

        return $patient->textenabled;
    }

    /***
     * Function that updates the value of textenabled value set by the user
     *
     * @param $universityId
     * @param $value
     */
    public function updateTextEnabledValue($universityId, $value)
    {
        \DB::table('patients')
            ->where('patients.ControlNo', '=', $universityId)
            ->update(array('textenabled' => $value));


    }

}
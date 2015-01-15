<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/7/15
 * Time: 3:32 PM
 */

namespace Scheduler\Repository;

class UserRepository
{


    /**
     * Method to retrive user data
     * @param $universityId
     */
    public function getUserProfile($universityId)
    {


        $dbUser = \DB::table('users')->join('patients', 'users.uid', '=', 'patients.pid')->where('patients.controlNo', '=', $universityId)->select(array(
            'uid',
            'users.ufname as firstName',
            'users.uminitial as middleName',
            'users.ulname as lastName',
            'users.uemail as email',
            'users.upaddress as addressLine1',
            'users.upaddress2 as addressLine2',
            'users.upcity as city',
            'users.upstate as state',
            'users.zipcode as zipCode',
            'dob as dateOfBirth',
            'sex',
            'patients.ControlNo as universityId',
            'umobileno as phone'
        ))->first();

        $user = new \User();

        array_walk($dbUser, function($v, $k) use (&$user)
        {
            $user->{$k} = $v;
        });


        return $user;
    }

}
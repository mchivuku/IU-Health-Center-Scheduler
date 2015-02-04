<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 10:55 AM
 */

namespace Scheduler\Repository;

class ProviderRepository{
    protected $table = 'doctors';

    /*
     *  select doctorID, PrintName from doctors
     *  where ActiveEndDate>=date_format(CURDate(),'%m/%d/%Y')
     *
     */
    public function getAllProviders($visitType){

        $date_format =  "date_format(CURDate(),'%m/%d/%Y')";

        // inactive or active;ActiveEndData is by the ecwdatabase;
        $providers = \DB::table($this->table)
            ->select( array('doctorID as Id','PrintName as Name'
            ))->where('ActiveEndDate','>=',\DB::raw($date_format))
            ->orderBy('PrintName', 'ASC')
            ->get();


        return $providers;


    }
}
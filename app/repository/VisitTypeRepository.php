<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:59 PM
 */
namespace Scheduler\Repository;



class VisitTypeRepository{
    protected $table = 'visitcodes';

    public function getAllVisitTypes(){

        $visitTypes_list = \DB::table($this->table)
            ->select( array('CodeId as Id','Description as Name'
            ))
            ->where('Name','!=',"' '")
            ->orderBy('Name', 'ASC')
            ->get();

        return $visitTypes_list;

    }

    //TODO - get Active Providers
    public function getProvidersForVisitCodeWithSchedule($visitCode,$facilityId,
                                                         $dayOfTheWeek,$morning){

        // 1.




    }




}
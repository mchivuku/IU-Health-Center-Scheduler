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

    //TODO - get visit types based on the facility ID - HOLD UNTIL TEST DATABASE IS UPDATED
    public function getAllVisitTypes($facilityId){

        $visitTypes_list = \DB::table($this->table)
            ->select( array('CodeId as Id','Description as Name'
            ))
            ->where('Name','!=',"' '")
            ->orderBy('Name', 'ASC')
            ->get();

        return $visitTypes_list;

    }

    /*
     *
     * Function to return visit name given visit code
     *
     */
    //TODO - tell Tamir Visit Code description is empty
    public function getVisitTypeName($visitCode){


        $visitType = \DB::table($this->table)
            ->select( array('Name as Name'
            ))
            ->where('Name','!=',"' '")
            ->where('CodeId','=',$visitCode)
            ->orderBy('Name', 'ASC')
            ->first();



        return $visitType->Name;
    }

}
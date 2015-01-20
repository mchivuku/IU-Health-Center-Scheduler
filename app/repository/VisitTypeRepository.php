<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:59 PM
 */
namespace Scheduler\Repository;

class FacilitiesRepository{
    protected $table = 'edi_facilities';

    public function getAllFacilities(){

        $visitTypes_list = \DB::table($this->table)
            ->select( array('Name as Id','Description as Name'
            ))->get();

        return $visitTypes_list;

    }
}
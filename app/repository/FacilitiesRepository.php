<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:54 PM
 */
namespace Scheduler\Repository;

class FacilitiesRepository{
    protected $table = 'edi_facilities';

    public function getAllFacilities(){

        $facilities_list = \DB::table($this->table)
            ->select( array('Id','Name'
            ))->orderBy('Name', 'ASC')
            ->get();

        return $facilities_list;

    }
}
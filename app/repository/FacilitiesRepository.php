<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:54 PM
 */
namespace Scheduler\Repository;

/**
 * Class FacilitiesRepository
 * Facilities repository contains methods to retrieve facilities from the database.
 *
 * @package Scheduler\Repository
 *
 */
class FacilitiesRepository
{
    /**
     * @var string $table - the table to refer that contains facility mapping with chart title.
     */
    protected $table = 'iu_scheduler_facility_charttitle';


    /***
     * Private method to return facilities from the database
     *
     * @param bool $facultyStaff - flag to indicate whether the facilities returned are for faculty staff.
     *
     * @return mixed
     */
    private function getFacilities($facultyStaff=false){

       $query= \DB::table($this->table)
            ->select(array('FacilityId as Id',
                'Description as Name', 'ChartTitle'))
            ->where('IsActive', '=', '1')
            ->orderBy('SortOrder','ASC');

        if($facultyStaff==1){
            $facilities_list =  $query->where('AllowedFacultyStaff','=','1')
                ->get();

         }else{
            $facilities_list =$query->get();
        }


        return $facilities_list;
    }


    /**
     * Public method that returns faculty/staff facilities
     *
     * @return mixed
     */
    public function getAllFacultyStaffFacilities()
    {
        return $this->getFacilities(true);

    }

    /**
     * Public method that returns student facilities
     *
     * @return mixed
     */
    public function getAllFacilities(){
        return $this->getFacilities();
    }


    /**
     * Public method returns chart title value given the facility Id.
     * Chart title maps into visitType table to returns visit types for a given facilities.
     *
     * @return mixed
     */
    public function getFacilityChartTitle($facilityId)
    {

        $facility = \DB::table($this->table)
            ->where('FacilityId', "=", $facilityId)
            ->orderBy('FacilityId', 'ASC')
            ->first();

        return $facility;

    }


}
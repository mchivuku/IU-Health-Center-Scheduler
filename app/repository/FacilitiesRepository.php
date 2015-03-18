<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:54 PM
 */
namespace Scheduler\Repository;

class FacilitiesRepository
{
    protected $table = 'iu_scheduler_facility_charttitle';


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



    /* Facilities allowed for faculty and staff*/
    public function getAllFacultyStaffFacilities()
    {
        return $this->getFacilities(true);

    }

    /* Facilities allowed for students */
    public function getAllFacilities(){
        return $this->getFacilities(false);
    }



    public function getFacilityChartTitle($facilityId)
    {

        $facility = \DB::table($this->table)
            ->where('FacilityId', "=", $facilityId)
            ->orderBy('FacilityId', 'ASC')
            ->first();

        return $facility;

    }


}
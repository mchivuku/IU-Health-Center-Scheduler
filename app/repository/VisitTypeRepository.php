<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/20/15
 * Time: 1:59 PM
 */
namespace Scheduler\Repository;


class VisitTypeRepository
{
    protected $table = 'visitcodes';

    public function getAllVisitTypes($facilityId)
    {

        $visitTypes_list = \DB::table($this->table)
            ->select(array('CodeId as Id', 'Description as Name'
            ))
            // facilityId - join with Chart title to retrieve visitTypes;
            ->whereExists(function ($query) use ($facilityId) {
                $query->select(\DB::raw(1))
                    ->from('iu_scheduler_facility_charttitle')
                    ->whereRaw('lower(iu_scheduler_facility_charttitle.ChartTitle) like
                                lower(visitcodes.ChartTitle)')
                    ->where('FacilityId', '=', $facilityId);
            })
            ->orderBy('Description', 'ASC')
            ->get();

        return $visitTypes_list;

    }

    /*
     *
     * Function to return visit name given visit code
     *
     */
    public function getVisitTypeName($visitCode)
    {


        $visitType = \DB::table($this->table)
            ->select(array('Description as Name'
            ))
            ->where('Name', '!=', "' '")
            ->where('CodeId', '=', $visitCode)
            ->orderBy('Name', 'ASC')
            ->first();


        return $visitType->Name;
    }

}
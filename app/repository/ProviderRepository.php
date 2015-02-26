<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 10:55 AM
 */

namespace Scheduler\Repository;

class ProviderRepository
{

    /*
     *
     *
     *select  doctorId as Id,concat(users.ulname, ", ", users.ufname) as Name ,CodeId,minutes
from visitcodesdetails
inner join
(select StartTime,EndTime,facilityId, UserId from workhours
inner join (
select  SetId,UserId from workinghourssets where UserId=9125
and (EndDate is null or (deleteFlag=0 and EndDate > NOW()))
)x  on  workhours.SetId = x.SetId
where weekday=2)y on visitcodesdetails.doctorId=y.UserId
inner join Users on visitcodesdetails.doctorId=Users.uid
order by CodeId
     *
     */

    //TODO - update the facilityId, workhours, weekday - if the providers are not available on a weekday
    public function getAllProvidersWithWorkHours($facilityId, $visitType, $date)
    {

         $raw_sql = $this->build_sql_week_day_clause($date);

         $providers = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('Id', 'Name','StartTime', 'EndTime','minutes'
            ))
            ->where('CodeId', '=', $visitType)
            ->where('facilityId','=',$facilityId)
            ->where('weekday', '=',$raw_sql )
            ->orderBy('Name', 'ASC')->get();


        return $providers;

    }

    /***
     *
     * Get work hours for the provider -
     *
     * @param $providerId
     * @param $facilityId
     * @param $visitType
     * @param $date
     * @return mixed
     *
     */
    public function getProviderWorkHours($providerId,$facilityId,$visitType,$date){
        $weekday = getDayOfTheWeek($date);

        $times = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('StartTime', 'EndTime','minutes'
            ))
            ->where('CodeId', '=', $visitType)
          //  ->where('facilityId','=',$facilityId)
            ->where('weekday', '=', $this->build_sql_week_day_clause($date))
            ->where('Id', '=',$providerId)
            ->first();


        return $times;
    }



    function build_sql_week_day_clause($date){

        return \DB::raw('DAYOFWEEK("'.$date .'")');

    }


    public function getProviderName($providerId){
        $name = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('Name'
            ))
            ->where('Id', '=', $providerId)
             ->first();

        return $name->Name;
    }


    public function  getFirstAvailableProviderWorkHours($facilityId,
                $visitType,$date){


    }

}


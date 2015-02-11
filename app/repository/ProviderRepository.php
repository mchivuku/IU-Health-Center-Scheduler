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
     *
     *
 select  doctorId as Id,concat(users.ulname, ", ", users.ufname) as Name ,CodeId,minutes
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

    //TODO - update the facilityId, workhours.
    public function getProvidersWithWorkHours($facilityId, $visitType, $date)
    {
        $weekday = getDayOfTheWeek($date);
        $providers = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('Id', 'Name','StartTime', 'EndTime'
            ))
            ->where('CodeId', '=', $visitType)
            ->where('facilityId','=',$facilityId)
            ->where('weekday', '=', $weekday)
            ->orderBy('Name', 'ASC')
            ->get();
         return $providers;

    }
}


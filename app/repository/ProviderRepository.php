<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 10:55 AM
 */

namespace Scheduler\Repository;

require_once 'AppointmentRepository.php';

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
            ->select(array('Id', 'Name', 'StartTime', 'EndTime', 'minutes'
            ))
            ->where('CodeId', '=', $visitType)
            ->where('facilityId', '=', $facilityId)
            ->where('weekday', '=', $raw_sql)
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
    public function getProviderWorkHours($providerId, $facilityId, $visitType, $date)
    {

        $times = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('StartTime', 'EndTime', 'minutes'
            ))
            ->where('CodeId', '=', $visitType)
            ->where('facilityId', '=', $facilityId)
            ->where('weekday', '=', $this->build_sql_week_day_clause($date))
            ->where('Id', '=', $providerId)
            ->first();
        return $times;
    }

    function getProviderWorkHoursForMonth($visitType, $facilityId, $providerId)
    {

        $times = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(\DB::Raw('min(StartTime) as StartTime, max(EndTime) as EndTime,  max(minutes) as minutes'
            ))
            ->where('CodeId', '=', $visitType)
            ->where('facilityId', '=', $facilityId)
            ->where('Id', '=', $providerId)
            ->first();
        return $times;
    }


    function build_sql_week_day_clause($date)
    {

        return \DB::raw('DAYOFWEEK("' . $date . '")');

    }


    public function getProviderName($providerId)
    {
        $name = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('Name'))
            ->where('Id', '=', $providerId)
            ->first();

        return $name->Name;
    }

    public function  getFirstAvailableProviderWorkHours($facilityId,
                                                        $visitType, $date, $startTime, $endTime)
    {

        $providers = $this->getAllProvidersWithWorkHours($facilityId, $visitType, $date);
        $pdo = \DB::connection('mysql')->getPdo();
        $pdo->setAttribute(\PDO::ATTR_EMULATE_PREPARES, true);
        $apptRep = new AppointmentRepository();

        $providerArray = array();

        foreach ($providers as $provider) {
            $overlapping_hours = get_overlapping_hr($provider->StartTime, $provider->EndTime, $startTime, $endTime);

            //get entire day for the times
            $available_times = $apptRep->getAllAppointmentTimes($visitType, $provider->Id,
                $provider->StartTime, $provider->EndTime, $date);


            $time_slots = array();
            foreach ($available_times as $available) {

                split_range_into_slots_by_duration($available['Available_from'], $available['Available_to'],
                    $provider->minutes * 60,
                    $time_slots);

            }

            if (count($time_slots) > 0) {
                //break the time into slots;
                $start = $overlapping_hours['startTime'];
                $end = $overlapping_hours['endTime'];

                $filter_times = array_filter($time_slots, function ($item) use ($start, $end, $date) {
                    if ($date == date('Y-m-d')) {
                        $timeNow = date('H:i');
                        return $item >= $start && $item <= $end && $item >= $timeNow;
                    }
                    return $item >= $start && $item <= $end;
                });


                $providerArray[$provider->Id] = array('Id' => $provider->Id, 'Name' => $provider->Name,
                    'minutes' => $provider->minutes, 'startTime' => $start, 'endTime' => $endTime,
                    'times' => $filter_times);


            }


        }


        usort($providerArray, function ($a1, $a2) {
            $name1 = $a1['Name'];
            $name2 = $a2['Name'];

            if ($name1 == $name2) {
                return 0;
            }
            return ($name1 > $name2) ? 1 : -1;
        });

        usort($providerArray, function ($item1, $item2) {

            $t1 = current($item1['times']);
            $t2 = current($item2['times']);

            if ($t1 == $t2) {
                return 0;
            }
            return ($t1 > $t2) ? 1 : -1;
        });


        return (current($providerArray));


    }

}


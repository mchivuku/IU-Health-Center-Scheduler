<?php
/**
 * Created by PhpStorm.
 * User: mchivuku
 * Date: 1/22/15
 * Time: 10:55 AM
 */

namespace Scheduler\Repository;

use Whoops\Example\Exception;

require_once 'AppointmentRepository.php';
require_once 'BaseRepository.php';

class ProviderRepository extends BaseRepository
{

    /*
     *
     *
     * Get providers with work hours for a week.
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

    function build_sql_week_day_clause($date)
    {

        return \DB::raw('DAYOFWEEK("' . $date . '")');

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

    /*
     *
     * Function to return provider work hours for a month
     */
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

    /*
     *
     * Function to return provider name given providerId
     */
    public function getProviderName($providerId)
    {
        $name = \DB::table('iu_scheduler_provider_schedule_info')
            ->select(array('Name'))
            ->where('Id', '=', $providerId)
            ->first();

        return $name->Name;
    }


    /***
     * Function to return first available provider hours
     * @param $facilityId
     * @param $visitType
     * @param $date
     * @param $startTime
     * @param $endTime
     */
    //TODO - change the query;
    public function  getFirstAvailableProviderWorkHours($facilityId,$visitType, $date, $startTime, $endTime)
    {

        $apptRep=new AppointmentRepository();


        $raw_sql = $this->build_sql_week_day_clause($date);

        //Get All provider for the weekday for the given visitType and facilityId
        $all_providers_query=  \DB::table('iu_scheduler_provider_schedule_info')
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->select(\DB::Raw(" '' as apptstartTime, '' as apptendTime,  Id as providerId ,
                 iu_scheduler_provider_schedule_info.StartTime,
                 iu_scheduler_provider_schedule_info.EndTime,
                 iu_scheduler_provider_schedule_info.minutes,
                 iu_scheduler_provider_schedule_info.Name, iu_scheduler_provider_schedule_info.LastName")
                );





        // 1. Appointment query
        $all_appt_times_query = \DB::table('enc')
            ->join('iu_scheduler_provider_schedule_info','iu_scheduler_provider_schedule_info.Id','=',
           'enc.resourceId')
            ->where('date', '=', $date)
            ->where('deleteFlag', '=', 0)
            ->whereRaw(\DB::RAW($apptRep->valid_appt_status_query()))
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->select(array('enc.startTime as apptstartTime',
                'enc.endTime as apptendTime','resourceId as providerId',
                'iu_scheduler_provider_schedule_info.StartTime',
                'iu_scheduler_provider_schedule_info.EndTime',
                'iu_scheduler_provider_schedule_info.minutes',
                'iu_scheduler_provider_schedule_info.Name','iu_scheduler_provider_schedule_info.LastName'
               ));



       // 2. Blocks query
        $blocks_query = \DB::table('ApptBlocks')
            ->join('ApptBlockDetails', 'ApptBlocks.Id', '=', 'ApptBlockDetails.Id')
            ->join('iu_scheduler_provider_schedule_info','iu_scheduler_provider_schedule_info.Id','=',
                'userId')
            ->where('StartDate', '=', $date)
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->select(array('ApptBlocks.StartTime as apptstartTime',
                'ApptBlocks.EndTime as apptendTime','userId as providerId',
                'iu_scheduler_provider_schedule_info.StartTime',
                'iu_scheduler_provider_schedule_info.EndTime' ,'iu_scheduler_provider_schedule_info.minutes',
                'iu_scheduler_provider_schedule_info.Name','iu_scheduler_provider_schedule_info.LastName'
            ));



        //3. Log query
        $scheduler_log_query = \DB::table('iu_scheduler_log')
            ->join('iu_scheduler_provider_schedule_info','iu_scheduler_provider_schedule_info.Id','=',
                'providerId')
            ->where('encDate', '=', $date)->where('iu_scheduler_log.facility', '=', $facilityId)
            ->where('visitType', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->select(array('iu_scheduler_log.startTime as apptstartTime',
                'iu_scheduler_log.endTime as apptendTime','providerId',
                'iu_scheduler_provider_schedule_info.StartTime',
                'iu_scheduler_provider_schedule_info.EndTime','iu_scheduler_provider_schedule_info.minutes',
                'iu_scheduler_provider_schedule_info.Name','iu_scheduler_provider_schedule_info.LastName'
            ));


        $all_providers = $all_providers_query->unionAll($all_appt_times_query)->unionAll($blocks_query)->unionAll
            ($scheduler_log_query)->get();


        //1. Group By providers
        $provider_times = array();
        foreach($all_providers as $time){
            if(array_key_exists($time->providerId,$provider_times)){
                $provider_times[$time->providerId]['times'][]=array('startTime'=>$time->apptstartTime,
                    'endTime'=>$time->apptendTime);
            }else{
                $provider_times[$time->providerId] =  array('Id' => $time->providerId,
                    'Name' => $time->Name,'LastName'=>$time->LastName,
                    'minutes' => $time->minutes, 'startTime' => $time->StartTime, 'endTime' => $time->EndTime,
                    'times' => array(array('startTime'=>$time->apptstartTime,'endTime'=>$time->apptendTime)));
            }


        }

        //2. For each provider - merge times
        foreach($provider_times as $k=>$v){
            if(count($v['times'])>0){
                $times = array_filter($v['times'],function($item){return $item['startTime']!=""&&
                $item['endTime']!="";});
                $merged_unavailable= $this->merge_unavailable($times);
                $provider_times[$k]['times']=
                     $this->construct_available_times($v['startTime'], $v['endTime'], $merged_unavailable);

            }else{
                $provider_times[$k]['times']=
                    $this->construct_available_times($v['startTime'], $v['endTime'], array());
            }


        }

        //use only providers that have times
        $available_providers = array_filter($provider_times,
            function($item){return count($item['times'])>0;});

        usort($available_providers, function($a,$b){
            $al = strtolower($a['LastName']);
            $bl = strtolower($b['LastName']);
            if ($al == $bl) {
                return 0;
            }
            return ($al > $bl) ? +1 : -1;

        });


        // For available provider - split the range into slots
        $providerArray= array();
        foreach ($available_providers as $k=>$v) {

            $overlapping_hours = get_overlapping_hr($v['startTime'],$v['endTime'],$startTime,$endTime);
            $time_slots = array();
            foreach($v['times'] as $available){

                split_range_into_slots_by_duration($available['Available_from'],
                    $available['Available_to'],
                    $v['minutes'] * 60,
                    $time_slots);
            }


            if (count($time_slots) > 0){
                //break the time into slots;
                $start = $overlapping_hours['startTime'];
                $end = $overlapping_hours['endTime'];

                $past_times =array();
                $filter_times = array_filter($time_slots, function ($item) use ($start, $end, $date,&$past_times) {
                    if ($date == date('Y-m-d')){
                        $timeNow = date('H:i');

                        if(($item <= $timeNow && $item>=$start && $item<=$end)){
                            $past_times[]= $item;
                        }

                        return $item >= $start && $item <= $end;
                    }


                    return $item >= $start && $item <= $end;
                });

                $providerArray[$v['Id']] = array('Id' => $v['Id'], 'Name' => $v['Name'],'LastName'=>$v['LastName'],
                    'minutes' => $v['minutes'], 'startTime' => $start, 'endTime' => $endTime,
                    'times' => $filter_times,'past_times'=>$past_times);

            }

        }

        usort($providerArray, function ($item1, $item2)use($date){

           //ToDO - think about it.
            if ($date == date('Y-m-d')) {
                $timeNow = date('H:i');
                $t1 = current(array_filter($item1['times'],function($x)use($timeNow){return $x>=$timeNow;}));
                $t2 = current(array_filter($item2['times'],function($x)use($timeNow){return $x>=$timeNow;}));

            }else{
                $t1 = current($item1['times']);
                $t2 = current($item2['times']);

            }

            if ($t1 == $t2) {
                return 0;
            }

            return ($t1 > $t2) ? 1 : -1;
        });

        return (current($providerArray));
    }




}


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

/**
 * Class ProviderRepository
 * Provider Repository - that contains methods 
 * @package Scheduler\Repository
 */
class ProviderRepository extends BaseRepository
{


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

        return \DB::raw('DAYOFWEEK("' . date('Y-m-d',strtotime($date)) . '")');

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
     * getFirstAvailableProviderWorkHours($facilityId,$visitType, $date, $tabId);
     */
    //TODO - change the query;
    public function  getFirstAvailableProviderWorkHours($facilityId,$visitType, $date, $scheduleID,$session_id)
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
            ->where('sessionId','!=',$session_id)
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

            $overlapping_hours = get_overlapping_hr($v['startTime'],$v['endTime'],$scheduleID);
            $time_slots = array();
            foreach($v['times'] as $available){

                split_range_into_slots_by_duration($available['Available_from'],
                    $available['Available_to'],
                    $v['minutes'] * 60,
                    $time_slots);
            }

            if(count($time_slots) > 0){
               //break the time into slots;
                $start = $overlapping_hours['startTime'];
                $end = $overlapping_hours['endTime'];

                $past_times =array();

                $filter_times = array_filter($time_slots, function ($item) use ($start, $end, $date,&$past_times) {
                    if ($date == date('Y-m-d')){
                        $time = SHOW_APPT_TIMENOW_OFFSET;
                        $timeNow = date('H:i',strtotime("+ $time minutes"));


                        if(($item <= $timeNow && $item>=$start && $item<=$end)){
                            $past_times[]= $item;
                        }

                        return $item >= $start && $item <= $end;
                    }

                     return $item >= $start && $item <= $end;

                });



                $providerArray[$v['Id']] = array('Id' => $v['Id'], 'Name' => $v['Name'],'LastName'=>$v['LastName'],
                    'minutes' => $v['minutes'], 'startTime' => $start, 'endTime' => $end,
                    'times' => $filter_times,'past_times'=>$past_times);

            }

        }



        //If we are looking at current date - check for the slot that is right after time now.
        if($date == date('Y-m-d')){


            //1. First Filter - provider that have times greater than time now.
            $providers_available_from_time_now = array_filter($providerArray,function($item){
                $timeNow = date('H:i');
                $times = $item['times'];
                return count(array_filter($times,function($element)use($timeNow){
                     return $element>=$timeNow;
                }))>0;

            });

            //nothing was found - previous tabId;
            if(count($providers_available_from_time_now)==0)return current($providerArray);

            usort($providers_available_from_time_now, function ($item1, $item2)use($date){
                $times1 = $item1['times'];
                $times2 =  $item2['times'];

                $t1 = "";
                $t2 = "";

                $timeNow = date('H:i');
                foreach($times1 as $slot){
                    if($slot>=$timeNow)
                    {
                        $t1 = $slot;
                        break;

                    }
                }
                foreach($times2 as $slot){
                    if($slot>=$timeNow)
                    {
                        $t2= $slot;
                        break;

                    }
                }

                if ($t1 === $t2) {
                    return 0;
                }

                return ($t1 > $t2) ? 1 : -1;
            });
           return current($providers_available_from_time_now);

        }

        // else get the first available based on the start time of the day.
        usort($providerArray, function ($item1, $item2){
            $times1 = $item1['times'];
            $times2 =  $item2['times'];

            $start1 = $item1['startTime'];
            $start2 = $item2['startTime'];

            foreach($times1 as $slot){
                if($slot>=$start1)
                {
                    $t1 = $slot;
                    break;

                }
            }

            foreach($times2 as $slot){
                if($slot>=$start2)
                {
                    $t2= $slot;
                    break;

                }
            }


            if ($t1 == $t2){
                return 0;
            }

            return ($t1 > $t2) ? 1 : -1;
        });


        return current($providerArray);



    }


}


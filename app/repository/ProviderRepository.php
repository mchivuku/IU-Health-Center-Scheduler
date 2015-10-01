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


    public static function log($obj,$query = null,$params=null)
    {
        $debug_query = function($string,$data) {
            if(isset($data) && count($data)>0){
                $indexed=$data==array_values($data);
                foreach($data as $k=>$v) {
                    if(is_string($v)) $v="'$v'";
                    if($indexed) $string=preg_replace('/\?/',$v,$string,1);
                    else $string=str_replace(":$k",$v,$string);
                }
            }

            return $string;
        };


        $log_file = app_path()."/".'param_dump_error_log.txt';

        if(file_exists($log_file)){
            $fh = fopen($log_file,'a');
        }else{
            $fh = fopen($log_file,'w');
        }

        if(isset($query)){
            $message= $debug_query($query,$params);
            fwrite($fh,$message."\n");
            fclose($fh);

        }else{

            $message = "<code><pre>";
            ob_start();

            if (is_object($obj)) {
                var_dump($obj);
            } else if (is_array($obj)) {
                print_r($obj);
            }else{
                $message.=$obj;
            }
            $message .= ob_get_clean();
            $message .= "</code><br />\n";
            fwrite($fh,$message."\n");
            fclose($fh);
        }


    }

    /**
     * Function called to load provider dropdown.
     */
    public function getAllProvidersWithWorkHours($facilityId, $visitType, $date)
    {


        $d = date('Y-m-d',strtotime($date));

        $raw_sql = $this->build_sql_week_day_clause($date);

        $sql =
            \DB::table('iu_scheduler_provider_schedule_info')
                ->select(array('Id', 'Name', 'StartTime', 'EndTime', 'minutes','StartDate','EndDate'
                ))
                ->where('CodeId', '=', $visitType)
                ->where('facilityId', '=', $facilityId)
                ->where('weekday', '=', $raw_sql)->whereRaw('(("'.$d.'">= StartDate and "'.$d.'"<=EndDate) or ("'.$d.'">= StartDate and EndDate is null))')
                ->orderBy('Name', 'ASC');


        $providers = $sql->get();

        return $providers;

    }

    function build_sql_week_day_clause($date)
    {

        return \DB::raw('DAYOFWEEK("' . date('Y-m-d',strtotime($date)) . '")');

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
            ->whereRaw('(("'.$date.'">= StartDate and "'.$date.'"<=EndDate) or ("'.$date.'">= StartDate and EndDate is
            null))')
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
    public function  getFirstAvailableProviderTimes($facilityId,$visitType, $d, $scheduleID,$session_id)
    {

        $date = date('Y-m-d',strtotime($d));


        $apptRep=new AppointmentRepository();


        $raw_sql = $this->build_sql_week_day_clause($date);
        $providers_working_dates_sql = '(("'.$date.'">= iu_scheduler_provider_schedule_info.StartDate and "'.$date
            .'"<=iu_scheduler_provider_schedule_info.EndDate) or
            ("'.$date.'">=
            iu_scheduler_provider_schedule_info.StartDate and iu_scheduler_provider_schedule_info.EndDate is
            null))';

        //Get All provider for the weekday for the given visitType and facilityId
        $all_providers_query=  \DB::table('iu_scheduler_provider_schedule_info')
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->whereRaw($providers_working_dates_sql)
            ->select(\DB::Raw(" '' as apptstartTime, '' as apptendTime,  Id as providerId ,
                 iu_scheduler_provider_schedule_info.StartTime,
                 iu_scheduler_provider_schedule_info.EndTime,
                 iu_scheduler_provider_schedule_info.minutes,
                 iu_scheduler_provider_schedule_info.Name,
                 iu_scheduler_provider_schedule_info.LastName")
            );


        // 1. Appointment query
        $all_appt_times_query = \DB::table('enc')
            ->join('iu_scheduler_provider_schedule_info',
                 'iu_scheduler_provider_schedule_info.Id','=',
                'enc.resourceId')
            ->where('date', '=', $date)
            ->where('deleteFlag', '=', 0)
            ->whereRaw(\DB::RAW($apptRep->valid_appt_status_query()))
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->whereRaw($providers_working_dates_sql)
            ->select(array('enc.startTime as apptstartTime',
                'enc.endTime as apptendTime','resourceId as providerId',
                'iu_scheduler_provider_schedule_info.StartTime',
                'iu_scheduler_provider_schedule_info.EndTime',
                'iu_scheduler_provider_schedule_info.minutes',
                'iu_scheduler_provider_schedule_info.Name',
                'iu_scheduler_provider_schedule_info.LastName'
            ));



        // 2. Blocks query
        $blocks_query = \DB::table('ApptBlocks')
            ->join('ApptBlockDetails', 'ApptBlocks.Id', '=', 'ApptBlockDetails.Id')
            ->join('iu_scheduler_provider_schedule_info','iu_scheduler_provider_schedule_info.Id','=',
                'userId')
            ->where('ApptBlocks.StartDate', '=', $date)
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.weekday', '=', $raw_sql)
            ->whereRaw($providers_working_dates_sql)
            ->select(array('ApptBlocks.StartTime as apptstartTime',
                'ApptBlocks.EndTime as apptendTime','userId as providerId',
                'iu_scheduler_provider_schedule_info.StartTime',
                'iu_scheduler_provider_schedule_info.EndTime' ,
                'iu_scheduler_provider_schedule_info.minutes',
                'iu_scheduler_provider_schedule_info.Name',
                'iu_scheduler_provider_schedule_info.LastName'
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


        //SQL Query


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



        if($available_providers>1){
            uasort($available_providers, function($a,$b){
                $al = strtolower($a['LastName']);
                $bl = strtolower($b['LastName']);
                if ($al == $bl) {
                    return 0;
                }
                return ($al > $bl) ? +1 : -1;

            });
        }



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
                        $time = \Config::get('settings.show_appt_timenow_offset');
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

        ProviderRepository::log('provider array - merged/split PHP_EOL');
        ProviderRepository::log($providerArray);


        //If we are looking at current date - check for the slot that is right after time now.
        if($date == date('Y-m-d')){

            $providers_available_from_time_now=array();
            //1. First Filter - provider that have times greater than time now.
            $providers_available_from_time_now = array_filter($providerArray,function($item){
                $timeNow = date('H:i');
                $times = $item['times'];
                return count(array_filter($times,function($element)use($timeNow){
                    return $element>=$timeNow;
                }))>0;

            });


            //nothing was found - previous tabId;
            if(is_null($providers_available_from_time_now)||count($providers_available_from_time_now)==0)
            {

                return isset($providerArray) && count($providerArray)>0?current($providerArray):'';
            }



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


            // ProviderRepository::log(current($providers_available_from_time_now));
            return current($providers_available_from_time_now);

        }

        $p = array_filter($providerArray,function($item) {
            return count($item['times']) > 0;
        });



        //no need to sort.
        usort( $p , function ($item1, $item2){

            $start1 = current($item1['times']);
            $start2 = current($item2['times']);

            if ($start1 == $start2){
                return 0;
            }

            return $start1 < $start2?-1:1;

        });


        ProviderRepository::log(current($p));

        return isset($p) && count($p)>0?current($p):'';

    }


    /**
     * Function to retrieve available appointment times for a given provider, visit-type, facility, sessionId
     *
     * the function will return all the appointment times that are available to the user instance.
     *
     * @param $facilityId - facility Id of interest
     * @param $visitType -  visit type of the appointment
     * @param $providerId - provider Id for whome the appointments should be returned.
     * @param $scheduleID - schedule ID indicates whether the appointment need to scheduled for Morning or Afternoon.
     * @param $sessionId - reserved slot that is saved in the database.
     * @param $date - appointment date - date to return appointment slots for.
     *
     * @return array - that contains provider times, appointment times, provider information
     */
    public function getAllAppointmentTimes($facilityId,$visitType, $providerId, $scheduleID, $d,$session_id)
    {
        $date = date('Y-m-d',strtotime($d));

        $apptRep = new AppointmentRepository();
        $provider_work_hours = $this->getProviderWorkHours($providerId,$facilityId,$visitType,$date);


        // 1. Appointment query
        $all_appt_times_query = \DB::table('enc')
            ->where("resourceId", "=", $providerId)
            ->where('date', '=', $date)
            ->where('deleteFlag', '=', 0)
            ->whereRaw(\DB::RAW($apptRep->valid_appt_status_query()))->select(array('startTime',
                'endTime'));

        // 2. Blocks query
        $blocks_query = \DB::table('ApptBlocks')
            ->join('ApptBlockDetails', 'ApptBlocks.Id', '=', 'ApptBlockDetails.Id')
            ->where('userId', '=', $providerId)->where('StartDate', '=', $date)
            ->select(array('StartTime as startTime',
                'EndTime as endTime'));

        //3. Log query
        $scheduler_log_query = \DB::table('iu_scheduler_log')
            ->where('providerId', '=', $providerId)->where('encDate', '=', $date)
            ->where('visitType', '=', $visitType)
            ->where('sessionId','!=',$session_id)
            ->select(array('startTime','endTime'));

        $unavailable = $all_appt_times_query->unionAll($blocks_query)->unionAll($scheduler_log_query)->get();

        $merged_unavailable = $this->merge_unavailable($unavailable);

        $available_times = $this->construct_available_times($provider_work_hours->StartTime,
            $provider_work_hours->EndTime,
            $merged_unavailable);


        $overlapping_hours = get_overlapping_hr($provider_work_hours->StartTime,
            $provider_work_hours->EndTime,
            $scheduleID);


        $time_slots = array();


        foreach ($available_times as $available){
            split_range_into_slots_by_duration($available['Available_from'],
                $available['Available_to'],
                $provider_work_hours->minutes*60,
                $time_slots);

        }

        $start = $overlapping_hours['startTime'];
        $end =   $overlapping_hours['endTime'];

        $past_times=array();

        $filter_times = array_filter($time_slots, function ($item) use ($start, $end, $date,&$past_times) {
            if ($date == date('Y-m-d')){
                $time = \Config::get('settings.show_appt_timenow_offset');
                $timeNow = date('H:i',strtotime("+ $time minutes"));

                if(($item <= $timeNow && $item>=$start && $item<=$end)){
                    $past_times[]= $item;
                }

                return $item >= $start && $item <= $end;
            }

            return $item >= $start && $item <= $end;

        });

        if(is_null($filter_times))$filter_times=array();


        return  array('Id' => $providerId,
            'minutes' => $provider_work_hours->minutes,
            'startTime' => $start, 'endTime' => $end,
            'times' => $filter_times,'past_times'=>$past_times);


    }


    /**
     * Function that returns available dates for a provider.
     *
     * @param $month - integer value of the month
     * @param $year - string value of the year
     * @param $providerId
     * @param $visitType
     * @param $sessionId
     * @param $startTime
     * @param $endTime
     * @param $duration
     * @providerId - Id of the provider for whome availableDates should be returned
     * @visitType - visitType of the appointment to retreive reserved slots in the scheduler_log_table.
     * @sessionId - sessionId value of the logged in user
     * @starttime - default start time for the day
     * @endtime - default end time for the day
     * @duration - duration of the visit.
     *
     * @return array - array of available dates
     */
    function getAvailableDates($month, $year, $providerId, $visitType, $facilityId,$sessionId, $startTime, $endTime,
                               $duration)
    {


        $apptRep = new AppointmentRepository();

        $provider_info = \DB::table('iu_scheduler_provider_schedule_info')
            ->where('iu_scheduler_provider_schedule_info.CodeId', '=', $visitType)
            ->where('iu_scheduler_provider_schedule_info.facilityId', '=', $facilityId)
            ->where('iu_scheduler_provider_schedule_info.Id','=',$providerId)
            ->groupBy('iu_scheduler_provider_schedule_info.StartDate','iu_scheduler_provider_schedule_info.EndDate',
                'iu_scheduler_provider_schedule_info.Id')
            ->select(\DB::Raw(" Id as providerId ,iu_scheduler_provider_schedule_info.StartDate,
                               iu_scheduler_provider_schedule_info.EndDate,
                               group_concat(iu_scheduler_provider_schedule_info.weekday) weekdays")
            )->first();



        $weekdays = explode(",",$provider_info->weekdays);

        // 1. Appts query
        $enc_query = \DB::table('enc')
            ->where("resourceId", "=", $providerId)
            ->whereRaw("month(date) = $month")
            ->whereRaw(\DB::RAW($apptRep->valid_appt_status_query()))
            ->whereRaw("year(enc.date)= $year")->where('deleteFlag', '=', 0)
            ->select(\DB::raw('timestamp(date,startTime) as startTime, timestamp(date,endTime) as endTime'));

        // 2. Blocks query
        $blocks_query = \DB::table('ApptBlocks')
            ->join('ApptBlockDetails', 'ApptBlocks.Id', '=', 'ApptBlockDetails.Id')
            ->where('userId', '=', $providerId)
            ->whereRaw('month(StartDate)=' . $month)
            ->whereRaw('year(StartDate)= ' . $year)
            ->select(\DB::raw('timestamp(StartDate,StartTime) as startTime, timestamp(StartDate,EndTime) as endTime'));

        //3. Log query
        $scheduler_log_query = \DB::table('iu_scheduler_log')
            ->where('providerId', '=', $providerId)
            ->whereRaw('month(encDate) =' . $month)
            ->whereRaw('year(encDate)=' . $year)
            ->where('visitType', '=', $visitType)
            ->where('sessionId', '!=', $sessionId)
            ->select(\DB::raw('timestamp(encDate,startTime) as startTime, timestamp(encDate,endTime) as endTime'));


        $unavailable = $enc_query->unionAll($blocks_query)->unionAll($scheduler_log_query)->get();

        $merged_unavailable = $this->merge_unavailable($unavailable);

        $group_times_by_days = function ($merged_unavailable) {
            if (count($merged_unavailable) == 0) return array();
            $temp = array();
            foreach ($merged_unavailable as $value) {
                $date = strtotime($value['startTime']);
                $current = date('Y-m-d', $date);

                if (!isset($temp[$current])) {
                    $temp[$current] = array();
                }
                array_push($temp[$current], $value);
            }

            return $temp;
        };


        $available = array();
        $x = $group_times_by_days($merged_unavailable);


        foreach ($x as $k => $item) {
            $start = date('Y-m-d H:i', strtotime($k . "" . $startTime));
            $end = date('Y-m-d H:i', strtotime($k . "" . $endTime));


            $available[$k] = array_filter($this->construct_available_times($start, $end, $item),
                function ($times) {
                    return $times['Available_to'] >= $times['Available_from'];
                });

        }

        $available_dates = array();

        $start_date = "01-" . $month . "-" . $year;
        $start_time = strtotime($start_date);

        $end_time = strtotime("+1 month", $start_time);

        for ($i = $start_time; $i < $end_time; $i += 86400) {
            $date = date('Y-m-d', $i);

            //check the date if the date is in the valid start and end date range and provider is working.


            //Else continue - date can be used.
            if (array_key_exists($date, $available)){
                $is_available = false;
                foreach ($available[$date] as $times) {
                    $interval = date_diff(new \DateTime($times['Available_to']),
                        new \DateTime($times['Available_from']));
                    $minutes = $interval->days * 24 * 60;
                    $minutes += $interval->h * 60;
                    $minutes += $interval->i;

                    if ($minutes >= $duration) {
                        $is_available = true;
                    }
                }

                if ($is_available == true){
                    if(($date>=$provider_info->StartDate && (!isset($provider_info->EndDate) ||
                            $provider_info->EndDate>=$date) && (in_array(getDayOfTheWeek($date),$weekdays))))
                        $available_dates[] = $date;
                }


            }else{
                if(($date>=$provider_info->StartDate && (!isset($provider_info->EndDate) ||
                        $provider_info->EndDate>=$date) && (in_array(getDayOfTheWeek($date),$weekdays))))
                    $available_dates[] = $date;
            }
        }

        return ($available_dates);


    }
}


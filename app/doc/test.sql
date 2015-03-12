SELECT
                               Available_from,Available_to
                                from
                                (SELECT @lasttime_to AS available_from, startTime AS available_to, @lasttime_to := endTime
                                                          FROM

                                                        (select startTime, endTime

                                                        from (

                                                        (select startTime, endTime
                                                        from enc
                                                        where enc.date = '2015-03-06' and
                                                        enc.resourceId=9125 and status IN ('PEN','ARR','CHK') and deleteflag=0
                                                        and startTime not in
(SELECT  t1.startTime

FROM enc t1
JOIN enc t2
ON t1.date = t2.date

AND t1.encounterID <> t2.encounterID AND T1.DELETEFLAG=0 AND T2.DELETEFLAG=0
WHERE
(t1.endtime >= t2.startTime AND t1.endTime <= t2.endTime
OR
t1.startTime >= t2.startTime AND t1.endTime <= t2.startTime)

and t1.date='2015-03-06')

   )
union all
(SELECT  case when t1.startTime<=t2.startTime then t1.starttime else t2.startTime
end as startTime,
 case when t1.endtime>=t2.endtime then t1.endtime else t2.endtime
end as endTime


FROM enc t1
JOIN enc t2
ON t1.date = t2.date

AND t1.encounterID <> t2.encounterID AND T1.DELETEFLAG=0 AND T2.DELETEFLAG=0
WHERE
(t1.endtime >= t2.startTime AND t1.endTime <= t2.endTime
OR
t1.startTime >= t2.startTime AND t1.endTime <= t2.startTime)

and t1.date='2015-03-06'

order by startTime
)

                                                        UNION all
                                                        (select StartTime as startTime,
                                                        EndTime as endTime
                                                        from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id
                                                        where userId='9125' and StartDate='2015-03-06' order by startTime)

                                                        )temp
                                                        UNION ALL SELECT  '17:00', '17:00'
                                                        order by startTime) e
                                                        JOIN (SELECT @lasttime_to := NULL) init) x

where Available_From <=Available_to



SELECT  available_from,available_to
                    from
                    (SELECT @lasttime_to AS available_from, startTime AS available_to,
                    @lasttime_to := endTime FROM (select startTime, endTime from
                    (select TIMESTAMP(date,startTime) as startTime,
                    Timestamp(date,endTime) as endTime from enc where month(enc.date) ='03' and year(enc.date)='2015'
                    and enc.resourceId=9125 UNION all select Timestamp(StartDate,StartTime) as startTime, timestamp(StartDate,
                    EndTime) as
                    endTime from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id where userId=9125 and
                    month(StartDate)='03' and year(StartDate)='2015'
                    )temp
                    UNION ALL

                    select
                    STR_TO_DATE(CONCAT(date_add(date(opendate2), interval -1 day ),
                    ' ', '16:00'),'%Y-%m-%d %H:%i') ,opendate2 from(
                    SELECT
                    @r:= STR_TO_DATE(CONCAT(date_add(@r, interval 1 day ),
                    ' ', '08:00'),'%Y-%m-%d %H:%i')
                    opendate2
                    FROM
                    (select @r :='2015-03-06') vars,
                    items limit 30 )monthdates2
                    order by startTime) e
                    JOIN (SELECT @lasttime_to := NULL) init)x
                    where exists (select 1 from visitcodesdetails where CodeId = 631
                    and TIMEDIFF(Available_to,Available_from) >= MAKETIME(0,Minutes,0))

                    and
                    Available_from between STR_TO_DATE(CONCAT(date(Available_from), ' ', '08:00'),
                    '%Y-%m-%d %H:%i')and Available_to <=STR_TO_DATE(CONCAT(date(Available_from), ' ', '16:00'), '%Y-%m-%d %H:%i')
                    order by Available_from asc



                    select startTime, endTime  from

                   ( select  startTime ,
                     endTime  from enc
                     where date='2015-03-06'
                     and enc.resourceId=9125

                    UNION all (select StartTime as startTime,EndTime as
                    endTime from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id where userId=9125 and
                    StartDate='2015-03-06'))
                    x
where Timediff(startTime,'09:00')<=0 and Timediff('09:15',endTime)<=0



update enc
set startTime='08:00'
where encounterId=632849



select * from
iu_scheduler_provider_schedule_info
where Id=9170 and CodeId=615

select * from iu_scheduler_log

 9136



 SELECT  count(*)     as total
                            from
                                 (select startTime, endTime
                                                        from enc
                                                        where enc.date = '2015-03-08' and
                                                        enc.resourceId= 9125 and status IN ('PEN','ARR','CHK')

                                                        UNION all
                                                        select StartTime as startTime,
                                                        EndTime as endTime
                                                        from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id
                                                        where userId='9125' and StartDate='2015-03-06'


                                                        UNION ALL
                                                        select  startTime,
                                                         endTime
                                                        from iu_scheduler_log
                                                        where providerId='9125' and encDate='2015-03-08' AND
                                                        visitType =482  and
                                                        sessionId!='_5b98b3471fd18dcc8d82bcd45b466f12')x
where TIMediff(startTime,'09:00')<=0 and timediff('09:15', endTime)<=0


  select *
                                                        from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id
                                                        where userId='9125' and StartDate='2015-03-06'

describe enc

select patientID as uid,encounterId , encounterId,status as visitStatus,date,startTime,endTime,facilityId
from enc where month(date)='03' and year(date)='2015' and resourceId=9125
and status IN ('PEN','CANC','CHK') and deleteFlag=0;

select * from appntconfemaillogs

select count(*) from tblwebTemplates;

select patientId fr
select Name as VisitType, CodeId as visittypeid  from visitcodes


SELECT  *
                            from
                                 (select startTime, endTime
                                                        from enc
                                                        where enc.date = '2015-03-10' and deleteFlag=0 and
                                                        enc.resourceId= '9125' and status IN ('PEN','ARR','CHK')

                                                        UNION all
                                                        select StartTime as startTime,
                                                        EndTime as endTime
                                                        from ApptBlocks block join ApptBlockDetails details
                                                        on block.Id = details.Id
                                                        where userId=9125 and StartDate='2015-03-10'
                                                        UNION ALL
                                                        select  startTime,
                                                         endTime
                                                        from iu_scheduler_log
                                                        where providerId=9125 and encDate='2015-03-10' AND
                                                        visitType = 631)x
where TIMediff(startTime,'10:15')<=0 and timediff('10:45',endTime)<=0

select * from edi_facilities
describe edi_facilities

select * from iu_scheduler_facility_charttitle

select * from encounterdata where encounterId=632881
select * from enc where encounterId=632881

select uid,ufname,ulname from patients
join users on patients.pid =users.uid
 where controlNo='0001494248'











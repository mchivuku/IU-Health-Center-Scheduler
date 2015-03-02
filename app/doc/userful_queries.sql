set wait_timeout=99999999999;

select * from enc where encounterID=632714

select * from cptfeeSch
where itemId in (
)
select * from patients where controlNo='0002376816'

select * from itemDetail where itemID in ()

select * from 	Cptfeesch where itemID in(select itemId from billingData where encounterId=632714)


where Id IN (
select * from 	Cptfeesch where itemID in()

select * from
ItemDetail  where ItemId IN(
select ItemId from edi_cptCodes where ItemID in(select itemId from billingData where encounterId=632714)
)
(SELECT
                 @r:= date_add(@r, interval 1 day ) OpenDate
            FROM
                 (select @r := current_date()) vars,
                items limit 30 )justDate

describe edi_cptCodes;
select * from edi_cptCodes;

select * from itemDetail where ItemId =7389
where propID = 13

select DoctorId,users.uname, users.ufname,users.ulname,CodeId from visitcodesdetails
inner join users on users.uid= doctorId
where CodeId=40

select * from visitcodesdetails
group by CodeId,DoctorId
having count(*)=1

describe Users
describe doctors
describe Patients

select * from workhours;

select CURRENT_TIMESTAMP , NOW()

select * from iu_scheduler_facility_chartitle_mapping


select  doctorId as Id,concat(users.ulname, ", ", users.ufname) as Name,
workinghourssets.StartTime, workinghourssets.EndTime,CodeId,
workinghourssets.Weekday
from visitcodesdetails
inner join users on doctorId = users.uid
inner join
(select * from workinghourssets
inner join workhours on workinghourssets.SetId = workinghourssets.SetId
where (EndDate is not null or EndDate > CURRENT_TIMESTAMP)
)workinghourssets on doctorId = workinghourssets.UserId
where
minutes>0
and CodeId=538 and weekday=2 and facilityId=2

select * from visitcodesdetails where CodeId=538

 select * from enc

select   * from workhours
join workinghourssets
on workhours.SetId  = workinghourssets.SetId
where   (EndDate is  null or EndDate > NOW()) and deleteFlag=0
and facilityId=2 and Weekday=2 and UserId IN (9398,9412,9417)



select inactive from doctors where doctorId IN (9398,9412,9417)

select * from users where uid IN (9398,9412,9417)


select  visitcodesdetails.doctorId as Id,
concat(users.ulname, ", ", users.ufname) as Name ,CodeId,minutes,StartTime,EndTime,Weekday,
Users.primaryservicelocation, Users.DefApptProvForResource
from visitcodesdetails
inner join iu_scheduler_provider_working_hours
on visitcodesdetails.doctorId=iu_scheduler_provider_working_hours.UserId
inner join Users on visitcodesdetails.doctorId=Users.uid
inner join doctors on doctors.doctorID=visitcodesdetails.doctorId
where inactive=0


SELECT Available_from, Available_to
FROM (
  SELECT @lasttime_to AS available_from, startTime AS available_to, @lasttime_to := endTime
    FROM (SELECT startTime, endTime
          FROM enc
          WHERE  enc.date = Date_add(CURRENT_DATE(), interval 1 day)
           UNION ALL SELECT '17:00', '17:00'
         ORDER BY startTime
) e
 JOIN (SELECT @lasttime_to := NULL) init)x
 Where Exists(
 SELECT startTime, endTime
          FROM enc
          WHERE  enc.date = Date_add(CURRENT_DATE(), interval 1 day)
)
Union ALL
SELECT Available_from, Available_to
FROM (
  SELECT @lasttime_to AS available_from,
         startTime AS available_to,
         @lasttime_to := endTime
    FROM
(SELECT  StartTime as startTime,
         EndTime as endTime from
         ApptBlocks block join
         ApptBlockDetails details on block.Id = details.Id
         where userId=9125 and StartDate=Date_Add(Current_date(), Interval 1 day)
         UNION ALL SELECT '17:00:00', '17:00:00'
         ORDER BY StartTime
) e
JOIN (SELECT @lasttime_to := NULL) init)x
Where Exists(
SELECT  * from
         ApptBlocks block join
         ApptBlockDetails details on block.Id = details.Id
         where userId=9125 and StartDate=Date_Add(Current_date(), Interval 1 day)
)

SELECT Available_from, Available_to
 from
 (SELECT @lasttime_to AS available_from, startTime AS available_to,
@lasttime_to := endTime FROM (select startTime, endTime from (select TIMESTAMP(date,startTime) as startTime,
 Timestamp(date,endTime) as endTime from enc where month(enc.date) =month('2015-03-03') and year(enc.date)=year(('2015-03-03'))
and enc.resourceId=9125 UNION all select Timestamp(StartDate,StartTime) as startTime, timestamp(StartDate,EndTime) as
endTime from ApptBlocks block join ApptBlockDetails details on block.Id = details.Id where userId=9125 and
 month(StartDate)=month(('2015-03-03')) and year(StartDate)=year (('2015-03-03')) UNION ALL select Timestamp(encDate,startTime),
Timestamp(encDate,endTime) from iu_scheduler_log where providerId=9125 and month(encDate)=month(('2015-03-03')) AND year(encDate)=
year (('2015-03-03')) and visitType =631  )temp
UNION ALL SELECT '2015-03-01 16:00', '2015-03-01 16:00' UNION ALL SELECT '2015-03-02 16:00', '2015-03-02 16:00' UNION ALL SELECT '2015-03-03 16:00', '2015-03-03 16:00' UNION ALL SELECT '2015-03-04 16:00', '2015-03-04 16:00' UNION ALL SELECT '2015-03-05 16:00', '2015-03-05 16:00' UNION ALL SELECT '2015-03-06 16:00', '2015-03-06 16:00' UNION ALL SELECT '2015-03-07 16:00', '2015-03-07 16:00' UNION ALL SELECT '2015-03-08 16:00', '2015-03-08 16:00' UNION ALL SELECT '2015-03-09 16:00', '2015-03-09 16:00' UNION ALL SELECT '2015-03-10 16:00', '2015-03-10 16:00' UNION ALL SELECT '2015-03-11 16:00', '2015-03-11 16:00' UNION ALL SELECT '2015-03-12 16:00', '2015-03-12 16:00' UNION ALL SELECT '2015-03-13 16:00', '2015-03-13 16:00' UNION ALL SELECT '2015-03-14 16:00', '2015-03-14 16:00' UNION ALL SELECT '2015-03-15 16:00', '2015-03-15 16:00' UNION ALL SELECT '2015-03-16 16:00', '2015-03-16 16:00' UNION ALL SELECT '2015-03-17 16:00', '2015-03-17 16:00' UNION ALL SELECT '2015-03-18 16:00', '2015-03-18 16:00' UNION ALL SELECT '2015-03-19 16:00', '2015-03-19 16:00' UNION ALL SELECT '2015-03-20 16:00', '2015-03-20 16:00' UNION ALL SELECT '2015-03-21 16:00', '2015-03-21 16:00' UNION ALL SELECT '2015-03-22 16:00', '2015-03-22 16:00' UNION ALL SELECT '2015-03-23 16:00', '2015-03-23 16:00' UNION ALL SELECT '2015-03-24 16:00', '2015-03-24 16:00' UNION ALL SELECT '2015-03-25 16:00', '2015-03-25 16:00' UNION ALL SELECT '2015-03-26 16:00', '2015-03-26 16:00' UNION ALL SELECT '2015-03-27 16:00', '2015-03-27 16:00' UNION ALL SELECT '2015-03-28 16:00', '2015-03-28 16:00' UNION ALL SELECT '2015-03-29 16:00', '2015-03-29 16:00' UNION ALL SELECT '2015-03-30 16:00', '2015-03-30 16:00' order by startTime) e
JOIN (SELECT @lasttime_to := NULL) init)x
where exists (select 1 from visitcodesdetails where CodeId = 631
and TIMEDIFF(Available_to,Available_from) >= MAKETIME(0,Minutes,0) )


 order by Available_from asc
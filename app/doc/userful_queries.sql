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

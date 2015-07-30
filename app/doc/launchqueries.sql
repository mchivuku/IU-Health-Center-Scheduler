
CREATE View iu_scheduler_provider_schedule_info as
select `visitcodesdetails`.`DoctorId` AS `Id`,concat(`users`.`ulname`,_latin1', ',`users`.`ufname`) AS `Name`,`users`.`ulname` AS `LastName`,`users`.`ufname` AS `FirstName`,`visitcodesdetails`.`CodeId` AS `CodeId`,`visitcodesdetails`.`Minutes` AS `minutes`,`iu_scheduler_provider_working_hours`.`StartTime` AS `StartTime`,`iu_scheduler_provider_working_hours`.`EndTime` AS `EndTime`,`iu_scheduler_provider_working_hours`.`Weekday` AS `Weekday`,`users`.`primaryservicelocation` AS `Primaryservicelocation`,`users`.`DefApptProvForResource` AS `DefApptProvForResource`,`iu_scheduler_provider_working_hours`.`facilityId` AS `FacilityId` from (((`visitcodesdetails` join `iu_scheduler_provider_working_hours` on((`visitcodesdetails`.`DoctorId` = `iu_scheduler_provider_working_hours`.`UserId`))) join `users` on((`visitcodesdetails`.`DoctorId` = `users`.`uid`))) join `doctors` on((`doctors`.`doctorID` = `visitcodesdetails`.`DoctorId`)))
where (`doctors`.`inactive` = 0)

CREATE VIEW iu_scheduler_provider_working_hours as
 select `workhours`.`StartTime` AS `StartTime`,`workhours`.`EndTime` AS
 `EndTime`,`workhours`.`facilityId` AS `facilityId`,`workinghourssets`.`UserId` AS `UserId`,`workhours`.`Weekday` AS `Weekday` from (`workhours` join `workinghourssets` on((`workhours`.`SetId` = `workinghourssets`.`SetId`))) where (isnull(`workinghourssets`.`EndDate`) or ((`workinghourssets`.`deleteFlag` = 0) and (`workinghourssets`.`EndDate` > now())))$$


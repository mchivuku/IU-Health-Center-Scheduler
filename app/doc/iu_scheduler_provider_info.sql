DELIMITER $$;

DROP VIEW IF EXISTS `mobiledoc`.`iu_scheduler_provider_schedule_info`$$

CREATE ALGORITHM=UNDEFINED DEFINER=`ecwDbUser`@`156.56.51.14` SQL SECURITY DEFINER VIEW `iu_scheduler_provider_schedule_info` AS


select `visitcodesdetails`.`DoctorId` AS `Id`,
concat(`users`.`ufname`,(case `users`.`ulname` when _utf8'' then _utf8'' else concat(_latin1' ',`users`.`ulname`) end),
(case `users`.`suffix` when _utf8'' then _utf8'' else concat(_latin1', ',`users`.`suffix`) end)) AS `Name`,
`users`.`ulname` AS `LastName`,`users`.`ufname` AS `FirstName`,
`visitcodesdetails`.`CodeId` AS `CodeId`,`visitcodesdetails`.`Minutes` AS `minutes`,
`iu_scheduler_provider_working_hours`.`StartTime` AS `StartTime`,
`iu_scheduler_provider_working_hours`.`EndTime` AS `EndTime`,
`iu_scheduler_provider_working_hours`.`Weekday` AS `Weekday`,
`users`.`primaryservicelocation` AS `Primaryservicelocation`,
`users`.`DefApptProvForResource` AS `DefApptProvForResource`,`iu_scheduler_provider_working_hours`.`facilityId` AS `FacilityId` ,
`iu_scheduler_provider_working_hours`.`StartDate` AS `StartDate`,
`iu_scheduler_provider_working_hours`.`EndDate` AS `EndDate`

from (((`visitcodesdetails` join `iu_scheduler_provider_working_hours` on((`visitcodesdetails`.`DoctorId` = `iu_scheduler_provider_working_hours`.`UserId`))) join `users` on((`visitcodesdetails`.`DoctorId` = `users`.`uid`))) join `doctors` on((`doctors`.`doctorID` = `visitcodesdetails`.`DoctorId`))) where (`doctors`.`inactive` = 0)$$

DELIMITER ;$$
DELIMITER $$;

DROP VIEW IF EXISTS `mobiledoc`.`iu_scheduler_provider_working_hours`$$

CREATE ALGORITHM=UNDEFINED DEFINER=`ecwDbUser`@`156.56.51.14` SQL SECURITY DEFINER VIEW `iu_scheduler_provider_working_hours` AS select `workhours`.`StartTime` AS `StartTime`,`workhours`.`EndTime` AS `EndTime`,`workhours`.`facilityId` AS `facilityId`,`workinghourssets`.`UserId` AS `UserId`,`workhours`.`Weekday` AS `Weekday`,`workinghourssets`.`StartDate` AS `StartDate`,`workinghourssets`.`EndDate` AS `EndDate` from (`workhours` join `workinghourssets` on((`workhours`.`SetId` = `workinghourssets`.`SetId`))) where (`workinghourssets`.`deleteFlag` = 0)$$

DELIMITER ;$$
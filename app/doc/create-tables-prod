/*
SQLyog - Free MySQL GUI v5.11
Host - 5.0.80-enterprise-nt-log : Database - mobiledoc
*********************************************************************
Server version : 5.0.80-enterprise-nt-log
*/


SET NAMES utf8;

SET SQL_MODE='';

create database if not exists `mobiledoc`;

USE `mobiledoc`;

/*Table structure for table `iu_scheduler_available_date_range` */

DROP TABLE IF EXISTS `iu_scheduler_available_date_range`;

CREATE TABLE `iu_scheduler_available_date_range` (
  `Id` int(11) NOT NULL auto_increment,
  `StartDate` date default NULL,
  `EndDate` date default NULL,
  `IsActive` smallint(6) default NULL,
  PRIMARY KEY  (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `iu_scheduler_available_date_range` */

insert into `iu_scheduler_available_date_range` (`Id`,`StartDate`,`EndDate`,`IsActive`) values (1,'2015-03-31','2016-06-09',1);

/*Table structure for table `iu_scheduler_facility_charttitle` */

DROP TABLE IF EXISTS `iu_scheduler_facility_charttitle`;

CREATE TABLE `iu_scheduler_facility_charttitle` (
  `FacilityId` int(11) NOT NULL,
  `Name` varchar(255) default NULL,
  `ChartTitle` varchar(100) default NULL,
  `Description` varchar(200) default NULL,
  `AllowedFacultyStaff` tinyint(4) default '0',
  `IsActive` tinyint(4) default '1',
  `SortOrder` int(11) default NULL,
  PRIMARY KEY  (`FacilityId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `iu_scheduler_facility_charttitle` */

insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (2,'IUHC Medclinic','med','Medical Concern',1,1,1);
insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (4,'Flu Special Clinic','flu','Flu Shots',1,1,7);
insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (5,'Health And Wellness','hw','Health And Wellness',1,1,3);
insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (6,'IUHC Ancillary','anc','IUHC Ancillary',0,1,4);
insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (7,'IUHC Caps','caps','Counselling ',1,1,5);
insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (9,'IUHC Immunization','imm','IUHC Immunization',0,1,6);
insert into `iu_scheduler_facility_charttitle` (`FacilityId`,`Name`,`ChartTitle`,`Description`,`AllowedFacultyStaff`,`IsActive`,`SortOrder`) values (11,'IUHC Womens Clinic','womens','Women\'s Clinic',1,1,2);

/*Table structure for table `iu_scheduler_log` */

DROP TABLE IF EXISTS `iu_scheduler_log`;

CREATE TABLE `iu_scheduler_log` (
  `id` int(11) NOT NULL auto_increment,
  `sessionId` varchar(50) default NULL,
  `controlNo` varchar(20) default NULL,
  `visitType` varchar(100) default NULL,
  `facility` int(11) default NULL,
  `providerId` int(11) default NULL,
  `startTime` time default NULL,
  `endTime` time default NULL,
  `encDate` date default NULL,
  `updateTimestamp` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `iu_scheduler_log` */

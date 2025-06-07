-- MySQL dump 10.13  Distrib 8.0.42, for macos15 (x86_64)
--
-- Host: 127.0.0.1    Database: taskpay_db
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `APPLICANT`
--

DROP TABLE IF EXISTS `APPLICANT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `APPLICANT` (
  `Applicant_ID` int NOT NULL,
  `Surname` varchar(255) NOT NULL,
  `First_Name` varchar(255) NOT NULL,
  `Middle_Name` varchar(255) DEFAULT NULL,
  `Suffix` varchar(50) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Sex` varchar(20) DEFAULT NULL,
  `Civil_Status` varchar(50) DEFAULT NULL,
  `DOB` date DEFAULT NULL,
  `Place_of_Birth` varchar(255) DEFAULT NULL,
  `House_No` varchar(100) DEFAULT NULL,
  `Street` varchar(255) DEFAULT NULL,
  `Brgy` varchar(255) DEFAULT NULL,
  `City` varchar(255) DEFAULT NULL,
  `Province` varchar(255) DEFAULT NULL,
  `TIN_No` varchar(50) DEFAULT NULL,
  `SSS_No` varchar(50) DEFAULT NULL,
  `Philhealth_No` varchar(50) DEFAULT NULL,
  `Landline` varchar(50) DEFAULT NULL,
  `Phone_Num` varchar(50) DEFAULT NULL,
  `Disability` varchar(255) DEFAULT NULL,
  `Emp_Status` varchar(100) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Applicant_ID`),
  CONSTRAINT `applicant_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `APPLICANT`
--

LOCK TABLES `APPLICANT` WRITE;
/*!40000 ALTER TABLE `APPLICANT` DISABLE KEYS */;
INSERT INTO `APPLICANT` VALUES (1,'Taskpay','One',NULL,'',28,'Male','Single','1996-03-15','Manila City','Blk 1 Lot 2','Sample Street','New Barangay','Quezon City','Metro Manila','111-222-333-000','02-1122334-5','010234567890','8877-1234','09100000001','None','Actively Looking','2025-06-04 17:17:52','2025-06-04 17:32:17'),(3,'dela cruz','andrei',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'09123456789',NULL,NULL,'2025-06-07 10:04:15','2025-06-07 10:04:15'),(4,'dela cruz','andrei',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'09123456789',NULL,NULL,'2025-06-07 10:07:59','2025-06-07 10:07:59'),(6,'test','dummy',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'09123456789',NULL,NULL,'2025-06-07 12:01:38','2025-06-07 12:01:38');
/*!40000 ALTER TABLE `APPLICANT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ATTACHMENTS`
--

DROP TABLE IF EXISTS `ATTACHMENTS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ATTACHMENTS` (
  `AttachmentID` int NOT NULL AUTO_INCREMENT,
  `Applicant_ID` int NOT NULL,
  `FileName` varchar(255) NOT NULL,
  `FilePath` varchar(512) NOT NULL,
  `FileType` varchar(100) DEFAULT NULL,
  `FileSize` int DEFAULT NULL,
  `UploadedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AttachmentID`),
  KEY `Applicant_ID` (`Applicant_ID`),
  CONSTRAINT `attachments_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `APPLICANT` (`Applicant_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ATTACHMENTS`
--

LOCK TABLES `ATTACHMENTS` WRITE;
/*!40000 ALTER TABLE `ATTACHMENTS` DISABLE KEYS */;
/*!40000 ALTER TABLE `ATTACHMENTS` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CERTIFICATION`
--

DROP TABLE IF EXISTS `CERTIFICATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CERTIFICATION` (
  `CertificationEntryID` int NOT NULL AUTO_INCREMENT,
  `Applicant_ID` int NOT NULL,
  `Certifications` varchar(255) NOT NULL,
  `course_date_from` date DEFAULT NULL,
  `course_date_to` date DEFAULT NULL,
  `Issuing_Organization` varchar(255) DEFAULT NULL,
  `Certification_Level` varchar(100) DEFAULT NULL,
  `Training_Duration` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CertificationEntryID`),
  UNIQUE KEY `applicant_certification_unique` (`Applicant_ID`,`Certifications`,`Issuing_Organization`),
  CONSTRAINT `certification_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `APPLICANT` (`Applicant_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CERTIFICATION`
--

LOCK TABLES `CERTIFICATION` WRITE;
/*!40000 ALTER TABLE `CERTIFICATION` DISABLE KEYS */;
INSERT INTO `CERTIFICATION` VALUES (1,1,'Certified Node.js Developer','2021-07-01',NULL,'Node Foundation','Professional','80 hours','2025-06-04 17:32:17','2025-06-04 17:32:17');
/*!40000 ALTER TABLE `CERTIFICATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `COMPANY_INFORMATION`
--

DROP TABLE IF EXISTS `COMPANY_INFORMATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `COMPANY_INFORMATION` (
  `CompanyInfo_ID` int NOT NULL AUTO_INCREMENT,
  `Cmp_Name` varchar(255) NOT NULL,
  `Cmp_Address` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CompanyInfo_ID`),
  UNIQUE KEY `cmp_name_unique` (`Cmp_Name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `COMPANY_INFORMATION`
--

LOCK TABLES `COMPANY_INFORMATION` WRITE;
/*!40000 ALTER TABLE `COMPANY_INFORMATION` DISABLE KEYS */;
INSERT INTO `COMPANY_INFORMATION` VALUES (1,'Tech Solutions PH','123 Ayala Ave, Makati','2025-06-04 17:32:17','2025-06-04 17:32:17');
/*!40000 ALTER TABLE `COMPANY_INFORMATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EDUCATION`
--

DROP TABLE IF EXISTS `EDUCATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `EDUCATION` (
  `EducationEntryID` int NOT NULL AUTO_INCREMENT,
  `Applicant_ID` int NOT NULL,
  `Educ_Level` varchar(255) NOT NULL,
  `School` varchar(255) DEFAULT NULL,
  `Course` varchar(255) DEFAULT NULL,
  `Awards` text,
  `Yr_Grad` varchar(20) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`EducationEntryID`),
  UNIQUE KEY `applicant_educ_level_unique` (`Applicant_ID`,`Educ_Level`,`School`,`Course`),
  CONSTRAINT `education_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `APPLICANT` (`Applicant_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EDUCATION`
--

LOCK TABLES `EDUCATION` WRITE;
/*!40000 ALTER TABLE `EDUCATION` DISABLE KEYS */;
INSERT INTO `EDUCATION` VALUES (1,1,'Bachelor\'s Degree','University of Example','Information Technology','Cum Laude','2018','2025-06-04 17:32:17','2025-06-04 17:32:17'),(2,1,'High School','Example National High',NULL,'Valedictorian','2014','2025-06-04 17:32:17','2025-06-04 17:32:17');
/*!40000 ALTER TABLE `EDUCATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PREFERENCE`
--

DROP TABLE IF EXISTS `PREFERENCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PREFERENCE` (
  `PreferenceEntryID` int NOT NULL AUTO_INCREMENT,
  `Applicant_ID` int NOT NULL,
  `Pref_Occupation` varchar(255) DEFAULT NULL,
  `Pref_Location` varchar(255) DEFAULT NULL,
  `Exp_Salary` decimal(12,2) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PreferenceEntryID`),
  UNIQUE KEY `applicant_preference_unique` (`Applicant_ID`,`Pref_Occupation`,`Pref_Location`),
  CONSTRAINT `preference_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `APPLICANT` (`Applicant_ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PREFERENCE`
--

LOCK TABLES `PREFERENCE` WRITE;
/*!40000 ALTER TABLE `PREFERENCE` DISABLE KEYS */;
INSERT INTO `PREFERENCE` VALUES (1,1,'Full Stack Developer','Remote (Philippines)',90000.00,'2025-06-04 17:32:17','2025-06-04 17:32:17');
/*!40000 ALTER TABLE `PREFERENCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Roles`
--

DROP TABLE IF EXISTS `Roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  `Description` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Roles`
--

LOCK TABLES `Roles` WRITE;
/*!40000 ALTER TABLE `Roles` DISABLE KEYS */;
INSERT INTO `Roles` VALUES (1,'applicant','A user looking for tasks/jobs.','2025-06-04 23:42:02','2025-06-04 23:42:02'),(2,'client','A user hiring talent or posting tasks.','2025-06-04 23:42:02','2025-06-04 23:42:02'),(3,'admin','A system administrator with full privileges.','2025-06-04 23:42:02','2025-06-04 23:42:02');
/*!40000 ALTER TABLE `Roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskApplications`
--

DROP TABLE IF EXISTS `TaskApplications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaskApplications` (
  `ApplicationID` int NOT NULL AUTO_INCREMENT,
  `Applicant_ID` int NOT NULL,
  `Task_ID` int NOT NULL,
  `ApplicationDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `Status` enum('Pending','ViewedByAdmin','Shortlisted','Approved','Withdrawn','Rejected','InProgress','SubmittedForReview','Completed','Cancelled') NOT NULL DEFAULT 'Pending',
  `CoverLetter` text,
  `ApplicantProposedBudget` decimal(12,2) DEFAULT NULL,
  `AdminFeedback` text,
  `ApplicantFeedback` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ApplicationID`),
  UNIQUE KEY `applicant_task_unique` (`Applicant_ID`,`Task_ID`),
  KEY `Task_ID` (`Task_ID`),
  CONSTRAINT `taskapplications_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `taskapplications_ibfk_2` FOREIGN KEY (`Task_ID`) REFERENCES `Tasks` (`TaskID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskApplications`
--

LOCK TABLES `TaskApplications` WRITE;
/*!40000 ALTER TABLE `TaskApplications` DISABLE KEYS */;
INSERT INTO `TaskApplications` VALUES (1,1,2,'2025-06-04 18:08:58','Pending','please give me job i want to earn money so i can spend on a harith skin as well as purchase some skincare products please please please i need to glow up my face please',6800.00,NULL,NULL,'2025-06-04 18:08:58','2025-06-04 18:08:58'),(2,3,2,'2025-06-07 13:24:28','Withdrawn','please give me job i want to earn money so i can spend on a harith skin as well as purchase some skincare products please please please i need to glow up my face please',6800.00,NULL,NULL,'2025-06-07 13:24:28','2025-06-07 13:26:13');
/*!40000 ALTER TABLE `TaskApplications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tasks`
--

DROP TABLE IF EXISTS `Tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tasks` (
  `TaskID` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Description` text NOT NULL,
  `ClientID` int DEFAULT NULL,
  `ClientName` varchar(255) DEFAULT NULL,
  `Budget` decimal(12,2) DEFAULT NULL,
  `Category` varchar(100) DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `PostedDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `Deadline` datetime DEFAULT NULL,
  `Duration` varchar(100) DEFAULT NULL,
  `TaskStatus` enum('Open','In Progress','Completed','Closed','Filled') NOT NULL DEFAULT 'Open',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TaskID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tasks`
--

LOCK TABLES `Tasks` WRITE;
/*!40000 ALTER TABLE `Tasks` DISABLE KEYS */;
INSERT INTO `Tasks` VALUES (1,'Graphic Design for New Cafe','Looking for a creative designer to create a logo and menu design for a new cafe. Modern and minimalist style preferred.',NULL,'The Coffee Spot',7000.00,'Graphic Design','Remote','2025-06-05 01:58:37','2025-07-15 00:00:00','2 Weeks','Open','2025-06-05 01:58:37','2025-06-05 01:58:37'),(2,'Data Entry for Inventory System','Need accurate data entry for over 1000 product SKUs into our new inventory system. Attention to detail is crucial.',NULL,'Retail Goods Inc.',4500.00,'Data Entry','Remote','2025-06-05 01:58:37','2025-06-30 00:00:00','1 Week','Open','2025-06-05 01:58:37','2025-06-05 01:58:37'),(3,'Content Writer for Blog','Seeking a skilled writer to produce 5 high-quality blog posts (1000 words each) on the topic of sustainable living.',NULL,'Green Future Co.',10000.00,'Writing','Remote','2025-06-05 01:58:37','2025-07-20 00:00:00','4 Weeks','Open','2025-06-05 01:58:37','2025-06-05 01:58:37');
/*!40000 ALTER TABLE `Tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserRoles`
--

DROP TABLE IF EXISTS `UserRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserRoles` (
  `UserRoleID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `RoleID` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserRoleID`),
  UNIQUE KEY `user_role_unique` (`UserID`,`RoleID`),
  KEY `RoleID` (`RoleID`),
  CONSTRAINT `userroles_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `userroles_ibfk_2` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`RoleID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserRoles`
--

LOCK TABLES `UserRoles` WRITE;
/*!40000 ALTER TABLE `UserRoles` DISABLE KEYS */;
INSERT INTO `UserRoles` VALUES (1,1,1,'2025-06-04 17:17:52','2025-06-04 17:17:52'),(2,2,3,'2025-06-04 17:49:18','2025-06-04 17:49:18'),(3,3,1,'2025-06-07 10:04:15','2025-06-07 10:04:15'),(4,4,1,'2025-06-07 10:07:59','2025-06-07 10:07:59'),(5,5,2,'2025-06-07 10:48:56','2025-06-07 10:48:56'),(6,6,1,'2025-06-07 12:01:38','2025-06-07 12:01:38');
/*!40000 ALTER TABLE `UserRoles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Email` varchar(255) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'taskpay@example.com','$2b$10$WtQO2Qg48IbM.Zvw9CBq/.eRsuhUgYSHUYn1RvnXUC5iAXl/g3FM6','2025-06-04 17:17:52','2025-06-04 17:17:52'),(2,'admin_taskpay@example.com','$2b$10$cj6kfTPZgdH2DMNJd03tu.l6XJuBLFTGPE9Ab9kqAa.Dc3HtvP9xu','2025-06-04 17:49:18','2025-06-04 17:49:18'),(3,'andrei@taskpay.com','$2b$10$kJWgBm8wFL8UvG7FdqVk2u2Tw9Z2qoqfO44Al7.kV6YLtv7cJI4q6','2025-06-07 10:04:15','2025-06-07 10:04:15'),(4,'andrei1@taskpay.com','$2b$10$Xe9VqFH5hAqZ2BO24jauw.GKr/EYj/8rfMK4/s5JQmPs0WYj5QKvC','2025-06-07 10:07:59','2025-06-07 10:07:59'),(5,'andrei2@taskpay.com','$2b$10$ISONjqSh.PJB.jp4UIjhpeO3mF5ZmlblzTjre1PXDeLwWm1HcdAa.','2025-06-07 10:48:55','2025-06-07 10:48:55'),(6,'dummytest@taskpay.com','$2b$10$O2kqMSCoZ5cuch5Rvw.OgO0b4edh8bZ5A9FoBNb5GwJBAoqqEUqRi','2025-06-07 12:01:38','2025-06-07 12:01:38');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WORK_EXPERIENCE`
--

DROP TABLE IF EXISTS `WORK_EXPERIENCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WORK_EXPERIENCE` (
  `WorkExperienceID` int NOT NULL AUTO_INCREMENT,
  `Applicant_ID` int NOT NULL,
  `CompanyInfo_ID` int DEFAULT NULL,
  `Cmp_Name_Manual` varchar(255) DEFAULT NULL,
  `Cmp_Address_Manual` text,
  `inclusive_date_from` date DEFAULT NULL,
  `inclusive_date_to` date DEFAULT NULL,
  `Position` varchar(255) DEFAULT NULL,
  `Status` varchar(100) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WorkExperienceID`),
  KEY `Applicant_ID` (`Applicant_ID`),
  KEY `CompanyInfo_ID` (`CompanyInfo_ID`),
  CONSTRAINT `work_experience_ibfk_1` FOREIGN KEY (`Applicant_ID`) REFERENCES `APPLICANT` (`Applicant_ID`) ON DELETE CASCADE,
  CONSTRAINT `work_experience_ibfk_2` FOREIGN KEY (`CompanyInfo_ID`) REFERENCES `COMPANY_INFORMATION` (`CompanyInfo_ID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WORK_EXPERIENCE`
--

LOCK TABLES `WORK_EXPERIENCE` WRITE;
/*!40000 ALTER TABLE `WORK_EXPERIENCE` DISABLE KEYS */;
INSERT INTO `WORK_EXPERIENCE` VALUES (1,1,1,NULL,NULL,'2019-06-01','2021-05-30','Junior Web Developer','Previous','2025-06-04 17:32:17','2025-06-04 17:32:17');
/*!40000 ALTER TABLE `WORK_EXPERIENCE` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-07 22:59:13

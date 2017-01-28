CREATE DATABASE  IF NOT EXISTS `zenrooms` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `zenrooms`;
-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: reloaded.club    Database: zenrooms
-- ------------------------------------------------------
-- Server version	5.5.5-10.1.21-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `rate`
--

DROP TABLE IF EXISTS `rate`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rate` (
  `idrate` varchar(20) NOT NULL,
  `idroomtype` int(11) NOT NULL,
  `price` float NOT NULL DEFAULT '0',
  `available` int(11) NOT NULL DEFAULT '0',
  `ratedate` date NOT NULL,
  PRIMARY KEY (`idrate`),
  KEY `idroomtype_idx` (`idroomtype`),
  CONSTRAINT `idroomtype_roomtype` FOREIGN KEY (`idroomtype`) REFERENCES `roomtype` (`idroomtype`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ratebackup`
--

DROP TABLE IF EXISTS `ratebackup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ratebackup` (
  `idratebackup` int(11) NOT NULL AUTO_INCREMENT,
  `idroomtype` int(11) NOT NULL,
  `price` float NOT NULL DEFAULT '0',
  `available` int(11) NOT NULL DEFAULT '0',
  `ratedate` date NOT NULL,
  `adddate` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idratebackup`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roomtype`
--

DROP TABLE IF EXISTS `roomtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roomtype` (
  `idroomtype` int(11) NOT NULL AUTO_INCREMENT,
  `roomtypename` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  `description` text CHARACTER SET latin1,
  `minimumprice` float NOT NULL DEFAULT '1',
  `totalrooms` int(3) DEFAULT '0',
  `active` int(1) DEFAULT '1',
  PRIMARY KEY (`idroomtype`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'zenrooms'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-01-29  2:15:13
INSERT INTO `roomtype` VALUES (1,'Single room',NULL,2000,5,1),(2,'Double room',NULL,2500,5,1);

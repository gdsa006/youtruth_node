-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 17, 2022 at 04:27 AM
-- Server version: 10.4.10-MariaDB
-- PHP Version: 7.3.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `videostreaming`
--

-- --------------------------------------------------------

--
-- Table structure for table `channel`
--

DROP TABLE IF EXISTS `channel`;
CREATE TABLE IF NOT EXISTS `channel` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `channelArt` text DEFAULT NULL,
  `visibility` tinyint(1) DEFAULT 1,
  `active` tinyint(1) DEFAULT 1,
  `status` enum('PUBLISHED','DELETED','BLOCKED') DEFAULT 'PUBLISHED',
  `userId` bigint(20) NOT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `channel`
--

INSERT INTO `channel` (`id`, `name`, `description`, `channelArt`, `visibility`, `active`, `status`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 'gforce', 'this is my tech channel', '/media/channels/131f64f4c3e74847b87b661a4fa7859b/poster_1671208335054.jpeg', 1, 1, 'PUBLISHED', 31, '2022-12-16 16:32:15', '2022-12-16 16:32:15');

-- --------------------------------------------------------

--
-- Stand-in structure for view `channel_view`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `channel_view`;
CREATE TABLE IF NOT EXISTS `channel_view` (
`channelTitle` varchar(100)
,`description` text
,`userId` bigint(20)
,`channelId` bigint(20)
,`createdBy` varchar(101)
,`createdAt` datetime
,`active` tinyint(1)
,`visibility` tinyint(1)
,`status` enum('PUBLISHED','DELETED','BLOCKED')
,`channelArt` text
,`subscribes` bigint(21)
,`videos` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `key_store`
--

DROP TABLE IF EXISTS `key_store`;
CREATE TABLE IF NOT EXISTS `key_store` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(25) NOT NULL,
  `value` text NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
CREATE TABLE IF NOT EXISTS `likes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `videoId` bigint(20) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `mail_audit`
--

DROP TABLE IF EXISTS `mail_audit`;
CREATE TABLE IF NOT EXISTS `mail_audit` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `to` varchar(100) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `messageId` varchar(100) DEFAULT NULL,
  `status` enum('INITIATED','SUCCESS','FAILED') NOT NULL DEFAULT 'INITIATED',
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `mail_audit`
--

INSERT INTO `mail_audit` (`id`, `to`, `subject`, `messageId`, `status`, `active`, `createdAt`, `updatedAt`) VALUES
(1, 'gdsa006@gmail.com', 'RESET PASSWORD', NULL, 'FAILED', 1, '2022-12-14 11:12:40', '2022-12-14 11:12:40'),
(2, 'gagandeepsinghahauja11@gmail.com', 'SIGNUP OTP', NULL, 'FAILED', 1, '2022-12-16 16:09:19', '2022-12-16 16:09:19');

-- --------------------------------------------------------

--
-- Table structure for table `reset_password`
--

DROP TABLE IF EXISTS `reset_password`;
CREATE TABLE IF NOT EXISTS `reset_password` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `token` text NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `reset_password`
--

INSERT INTO `reset_password` (`id`, `userId`, `token`, `active`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOiI3IG1pbnV0ZXMgYWdvIiwiYXZhdGFyIjpudWxsLCJmaXJzdE5hbWUiOiJnYWdhbiIsImxhc3ROYW1lIjoiYWh1amEiLCJnZW5kZXIiOiJNIiwiZG9iIjoiMDQtMDUtMTk4NyIsImVtYWlsIjoiZ2RzYTAwNkBnbWFpbC5jb20iLCJtb2JpbGUiOjIzNDMyMjQ0NDMsImJpbyI6bnVsbCwiYWRkcmVzcyI6bnVsbCwiaWQiOjEsInN0YXR1cyI6IkFDVElWRSIsInN0ZCI6IisyNDQiLCJpYXQiOjE2NzEwMTYzNjAsImV4cCI6MTY3MTAxODE2MCwiYXVkIjoiY2xpZW50IiwiaXNzIjoidmlkZW8tc3RyZWFtIiwic3ViIjoiYXV0aCJ9.GXNeYSkOngZYgDIh7SAJLl1KkBIxA81HcQa_TCdr-X_YvqkniAJnmECMu5uOEP_ut8zRQ8jn1lMbHUzCLR2wPg', 1, '2022-12-14 11:12:40', '2022-12-14 11:12:40');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `id` int(200) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `createdAt` date NOT NULL,
  `updatedAt` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'USER', '2022-12-01', '2022-12-01'),
(2, 'ADMIN', '2022-12-01', '2022-12-01');

-- --------------------------------------------------------

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
CREATE TABLE IF NOT EXISTS `subscription` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `channelId` bigint(20) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) DEFAULT NULL,
  `gender` enum('M','F','O') NOT NULL,
  `dob` varchar(30) DEFAULT NULL,
  `mobile` bigint(13) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `std` varchar(8) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `title` varchar(25) DEFAULT NULL,
  `status` enum('BLOCKED','INACTIVE','ACTIVE','PENDING') DEFAULT 'PENDING',
  `active` tinyint(1) DEFAULT 0,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `firstName`, `lastName`, `gender`, `dob`, `mobile`, `email`, `password`, `bio`, `avatar`, `std`, `address`, `title`, `status`, `active`, `createdAt`, `updatedAt`) VALUES
(10, 'gagan', 'ahuja', 'M', '04-05-1987', 9779041144, 'gdsa006@gmail.com', '$2b$10$DlknU0BJYZ1JRdY5qbNRZeQDl134jc0cH6ayWQ7.IWd7799pIk5X6', NULL, NULL, '+91', NULL, NULL, 'PENDING', 0, '2022-12-16 06:13:29', '2022-12-16 06:13:29'),
(31, 'gagan', 'ahuja', 'M', '04-05-1987', 1111111111, 'gagandeepsinghahauja11@gmail.com', '$2b$10$n8wfYAjoheM2W4sZXIRQEuQNRlog/Pe7J8MVS9D6wxuOnGM6Gakxq', NULL, NULL, '+7 840', NULL, NULL, 'ACTIVE', 1, '2022-12-16 16:09:18', '2022-12-16 16:09:18');

-- --------------------------------------------------------

--
-- Table structure for table `user_otp`
--

DROP TABLE IF EXISTS `user_otp`;
CREATE TABLE IF NOT EXISTS `user_otp` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `otp` int(8) NOT NULL,
  `type` enum('SIGNUP','UPDATE_PASSWORD') NOT NULL,
  `expiryTime` int(2) NOT NULL DEFAULT 15,
  `expiryUnit` enum('MIN','SEC','HOUR') NOT NULL DEFAULT 'MIN',
  `errorCount` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_otp`
--

INSERT INTO `user_otp` (`id`, `email`, `otp`, `type`, `expiryTime`, `expiryUnit`, `errorCount`, `active`, `createdAt`, `updatedAt`) VALUES
(2, 'gagandeepsinghahauja11@gmail.com', 599969, 'SIGNUP', 15, 'MIN', 0, 1, '2022-12-16 16:09:19', '2022-12-16 16:09:19');

-- --------------------------------------------------------

--
-- Table structure for table `user_role_mapping`
--

DROP TABLE IF EXISTS `user_role_mapping`;
CREATE TABLE IF NOT EXISTS `user_role_mapping` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `roleId` int(5) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user_role_mapping`
--

INSERT INTO `user_role_mapping` (`id`, `userId`, `roleId`, `active`, `createdAt`, `updatedAt`) VALUES
(3, 29, 1, 1, '2022-12-16 16:00:39', '2022-12-16 16:00:39'),
(4, 30, 1, 1, '2022-12-16 16:05:46', '2022-12-16 16:05:46'),
(5, 31, 1, 1, '2022-12-16 16:09:18', '2022-12-16 16:09:18');

-- --------------------------------------------------------

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
CREATE TABLE IF NOT EXISTS `video` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `hash` varchar(35) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `duration` double(5,2) DEFAULT 0.00,
  `channelId` bigint(20) DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `categoryId` tinyint(2) DEFAULT 0,
  `visibility` tinyint(1) DEFAULT 1,
  `status` enum('PUBLISHED','REJECTED','PENDING','DELETED','BLOCKED') DEFAULT 'PENDING',
  `poster` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hash` (`hash`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `video`
--

INSERT INTO `video` (`id`, `hash`, `name`, `description`, `duration`, `channelId`, `userId`, `categoryId`, `visibility`, `status`, `poster`, `active`, `createdAt`, `updatedAt`) VALUES
(1, '298715da9b5c044348d547a5fae9bbad', 'First Video', 'this is my first video', 0.00, 1, 31, 1, 1, 'PENDING', NULL, 1, '2022-12-16 16:32:51', '2022-12-16 16:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `video_audit`
--

DROP TABLE IF EXISTS `video_audit`;
CREATE TABLE IF NOT EXISTS `video_audit` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `hash` varchar(64) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `channelId` bigint(20) DEFAULT NULL,
  `userId` bigint(20) NOT NULL,
  `categoryId` tinyint(2) DEFAULT 0,
  `poster` varchar(255) DEFAULT NULL,
  `visibility` tinyint(1) DEFAULT 1,
  `status` tinyint(1) DEFAULT 0,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `video_audit`
--

INSERT INTO `video_audit` (`id`, `hash`, `name`, `description`, `channelId`, `userId`, `categoryId`, `poster`, `visibility`, `status`, `createdAt`, `updatedAt`) VALUES
(1, '298715da9b5c044348d547a5fae9bbad', 'First Video', 'this is my first video', 1, 31, 1, NULL, 1, 1, '2022-12-16 16:32:51', '2022-12-16 16:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `video_category`
--

DROP TABLE IF EXISTS `video_category`;
CREATE TABLE IF NOT EXISTS `video_category` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `fontAwesomeClass` varchar(100) DEFAULT 'fa fa-indent',
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `video_category`
--

INSERT INTO `video_category` (`id`, `name`, `fontAwesomeClass`, `active`, `createdAt`, `updatedAt`) VALUES
(1, 'SOLUTIONS', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(2, 'PEACE', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(3, 'HEALING', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(4, 'SCIENCE', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(5, 'TECHNOLOGY', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(6, 'DEBT', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(7, 'TAXES', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(8, 'LIBERATION', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(9, 'MUSIC', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(10, 'MEDIA', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07'),
(11, 'HUMOR', 'fa fa-indent', 1, '2022-12-01 17:59:07', '2022-12-01 17:59:07');

-- --------------------------------------------------------

--
-- Table structure for table `video_format`
--

DROP TABLE IF EXISTS `video_format`;
CREATE TABLE IF NOT EXISTS `video_format` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `videoId` varchar(35) NOT NULL,
  `resolution` varchar(8) NOT NULL DEFAULT 'DEFAULT',
  `videoPath` varchar(255) DEFAULT NULL,
  `meta` text NOT NULL,
  `status` tinyint(1) DEFAULT 0,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `video_format`
--

INSERT INTO `video_format` (`id`, `videoId`, `resolution`, `videoPath`, `meta`, `status`, `active`, `createdAt`, `updatedAt`) VALUES
(1, '1', 'DEFAULT', '\\home\\sandeepkr977\\stream-app-upload\\videos\\298715da9b5c044348d547a5fae9bbad\\default\\298715da9b5c044348d547a5fae9bbad.mp4', '{}', 1, 1, '2022-12-16 16:32:51', '2022-12-16 16:32:51');

-- --------------------------------------------------------

--
-- Stand-in structure for view `video_view`
-- (See below for the actual view)
--
DROP VIEW IF EXISTS `video_view`;
CREATE TABLE IF NOT EXISTS `video_view` (
`videoTitle` varchar(100)
,`hash` varchar(35)
,`description` text
,`active` tinyint(1)
,`visibility` tinyint(1)
,`category` varchar(100)
,`createdBy` varchar(101)
,`createdAt` datetime
,`userId` bigint(20)
,`videoId` bigint(20)
,`poster` varchar(255)
,`likes` bigint(21)
,`views` bigint(21)
,`status` enum('PUBLISHED','REJECTED','PENDING','DELETED','BLOCKED')
,`channelId` bigint(20)
,`channelTitle` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `views`
--

DROP TABLE IF EXISTS `views`;
CREATE TABLE IF NOT EXISTS `views` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) DEFAULT NULL,
  `videoId` bigint(20) NOT NULL,
  `ipAddress` varchar(20) NOT NULL,
  `meta` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `watch_later`
--

DROP TABLE IF EXISTS `watch_later`;
CREATE TABLE IF NOT EXISTS `watch_later` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) NOT NULL,
  `videoId` bigint(20) NOT NULL,
  `active` tinyint(1) DEFAULT 1,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure for view `channel_view`
--
DROP TABLE IF EXISTS `channel_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `channel_view`  AS  select `c`.`name` AS `channelTitle`,`c`.`description` AS `description`,`c`.`userId` AS `userId`,`c`.`id` AS `channelId`,concat(`u`.`firstName`,' ',`u`.`lastName`) AS `createdBy`,`c`.`createdAt` AS `createdAt`,`c`.`active` AS `active`,`c`.`visibility` AS `visibility`,`c`.`status` AS `status`,`c`.`channelArt` AS `channelArt`,(select count(`s`.`id`) from `subscription` `s` where `s`.`active` = 1 and `s`.`channelId` = `c`.`id`) AS `subscribes`,(select count(`v`.`id`) from `video` `v` where `v`.`channelId` = `c`.`id` and `v`.`status` = 'PUBLISHED' and `v`.`active` = 1 and `v`.`visibility` = 1) AS `videos` from (`channel` `c` left join `user` `u` on(`u`.`id` = `c`.`userId`)) where `c`.`active` = 1 and `c`.`visibility` = 1 and `c`.`status` = 'PUBLISHED' ;

-- --------------------------------------------------------

--
-- Structure for view `video_view`
--
DROP TABLE IF EXISTS `video_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `video_view`  AS  select `v`.`name` AS `videoTitle`,`v`.`hash` AS `hash`,`v`.`description` AS `description`,`v`.`active` AS `active`,`v`.`visibility` AS `visibility`,`cat`.`name` AS `category`,concat(`u`.`firstName`,' ',`u`.`lastName`) AS `createdBy`,`v`.`createdAt` AS `createdAt`,`u`.`id` AS `userId`,`v`.`id` AS `videoId`,`v`.`poster` AS `poster`,(select count(`l`.`id`) from `likes` `l` where `l`.`videoId` = `v`.`id` and `l`.`active` = 1) AS `likes`,(select count(`vw`.`id`) from `views` `vw` where `vw`.`active` = 1 and `vw`.`videoId` = `v`.`id`) AS `views`,`v`.`status` AS `status`,`c`.`id` AS `channelId`,`c`.`name` AS `channelTitle` from (((`video` `v` left join `channel` `c` on(`c`.`id` = `v`.`channelId`)) left join `user` `u` on(`u`.`id` = `v`.`userId`)) left join `video_category` `cat` on(`cat`.`id` = `v`.`categoryId`)) where `c`.`active` = 1 and `c`.`visibility` = 1 and `v`.`active` = 1 and `c`.`visibility` = 1 and `v`.`status` = 'PUBLISHED' ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

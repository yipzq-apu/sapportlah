-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 17, 2025 at 01:23 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sapportlah_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE IF NOT EXISTS `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `short_description` varchar(500) DEFAULT NULL,
  `goal_amount` decimal(12,2) NOT NULL,
  `current_amount` decimal(12,2) DEFAULT '0.00',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','active','successful','failed','cancelled','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'pending',
  `reason` varchar(255) DEFAULT NULL,
  `is_featured` tinyint(1) DEFAULT '0',
  `backers_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `campaigns`
--

INSERT INTO `campaigns` (`id`, `user_id`, `category_id`, `title`, `description`, `short_description`, `goal_amount`, `current_amount`, `start_date`, `end_date`, `featured_image`, `status`, `reason`, `is_featured`, `backers_count`, `created_at`, `updated_at`) VALUES
(19, 17, 2, 'Love My School', 'MyKasih relies entirely on donations from the public and corporate bodies to help fund its welfare programmes. Donors are assured that 100 percent of their contributions go to underserved families and students to help meet their immediate needs.\n\nAll cash donations to MyKasih Foundation are TAX-EXEMPT and passed IN FULL to beneficiaries.', '“Love My School” helps students with bursaries / aid for canteen food / school supplies, again via the cashless system.', 100000.00, 0.00, '2025-09-24 00:00:00', '2025-10-31 00:00:00', 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758025883/sapportlah/campaigns/fdyikofhcafc30turjvl.jpg', 'pending', NULL, 0, 0, '2025-09-16 12:38:15', '2025-09-16 12:38:15'),
(20, 17, 3, 'Feed a Family: RM100 Food Aid Campaign', 'This campaign aims to provide food aid worth RM100 per family to underprivileged households in urban and rural Malaysia. Beneficiaries will be able to purchase rice, cooking oil, canned food, and fresh produce at participating retail outlets using a cashless aid system. Every RM100 donated ensures one family does not go hungry for an entire month. The campaign’s target is RM50,000, enough to support 500 families.', 'Help low-income families put food on the table with essential groceries for a month.', 20000.00, 2100.00, '2025-09-09 00:00:00', '2025-10-31 00:00:00', 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758026506/sapportlah/campaigns/wrfftoexxozbs6rvg0kl.jpg', 'active', NULL, 1, 1, '2025-09-16 12:42:06', '2025-09-16 17:58:10'),
(21, 17, 2, 'Bright Futures: Support School Supplies for Children', 'Education is the key to breaking the cycle of poverty. Through this campaign, donations will be used to provide school uniforms, shoes, textbooks, and stationery to children from struggling families. Each contribution of RM80 equips one child with essential learning materials for a school term. The campaign’s goal is RM40,000, which will support 500 students under the “Love My School” initiative, ensuring they have equal opportunities to learn and thrive.', 'Give children from low-income households the tools they need to succeed in school.', 40000.00, 0.00, '2025-09-10 00:00:00', '2025-10-23 00:00:00', 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758026586/sapportlah/campaigns/g4221nirh2huwvsmlgy0.jpg', 'active', NULL, 0, 0, '2025-09-16 12:43:42', '2025-09-16 12:49:11'),
(22, 17, 3, 'Emergency Relief: Flood Aid for Affected Families', 'Every year, floods displace thousands of Malaysians, leaving them without food, shelter, and clothing. This campaign focuses on raising funds for emergency food packs, blankets, hygiene kits, and temporary shelter support for families in flood-affected states. Each RM150 donation provides a complete relief pack for one family. The campaign targets RM75,000, enabling support for 500 families in flood-stricken communities. Transparency will be ensured through a cashless disbursement model, where aid is tracked and distributed efficiently.', 'Provide urgent relief to families affected by seasonal floods in Malaysia.', 1000000.00, 700.00, '2025-09-01 00:00:00', '2025-10-30 00:00:00', 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758026693/sapportlah/campaigns/yowmiqzpxta7slcpwoff.jpg', 'active', NULL, 0, 1, '2025-09-16 12:45:09', '2025-09-16 22:39:17'),
(23, 17, 1, 'test', 'test', 'test', 1000.00, 0.00, '2025-09-24 00:00:00', '2025-10-30 00:00:00', 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758052535/sapportlah/campaigns/bzyraic7uzfir7hcmusl.png', 'approved', NULL, 1, 0, '2025-09-16 19:55:53', '2025-09-16 19:57:31');

-- --------------------------------------------------------

--
-- Table structure for table `campaign_images`
--

DROP TABLE IF EXISTS `campaign_images`;
CREATE TABLE IF NOT EXISTS `campaign_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `caption` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `campaign_images`
--

INSERT INTO `campaign_images` (`id`, `campaign_id`, `image_url`, `caption`, `sort_order`, `created_at`) VALUES
(33, 19, 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758025895/sapportlah/campaigns/d4x4twnz8me67natuyqy.jpg', NULL, 1, '2025-09-16 12:38:17'),
(34, 20, 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758026512/sapportlah/campaigns/enb8lho6lsbe8w9i2nov.jpg', NULL, 1, '2025-09-16 12:42:07'),
(35, 21, 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758026592/sapportlah/campaigns/dlpk7wals2jatzus43ff.jpg', NULL, 1, '2025-09-16 12:43:43');

-- --------------------------------------------------------

--
-- Table structure for table `campaign_updates`
--

DROP TABLE IF EXISTS `campaign_updates`;
CREATE TABLE IF NOT EXISTS `campaign_updates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaign_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_backers_only` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `campaign_updates`
--

INSERT INTO `campaign_updates` (`id`, `campaign_id`, `title`, `content`, `is_backers_only`, `created_at`) VALUES
(4, 22, 'test', 'test', 0, '2025-09-16 19:54:48');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Medical'),
(2, 'Education'),
(3, 'Social Causes'),
(4, 'Environment'),
(5, 'Sports'),
(6, 'Others');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
CREATE TABLE IF NOT EXISTS `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `campaign_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `anonymous` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `parent_id` (`parent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `campaign_id`, `parent_id`, `content`, `anonymous`, `created_at`) VALUES
(14, 18, 20, NULL, 'where is the campaign location?', 0, '2025-09-16 13:15:38'),
(15, 18, 22, NULL, 'test', 0, '2025-09-16 19:51:40'),
(16, 17, 22, 15, 'test', 0, '2025-09-16 19:53:50');

-- --------------------------------------------------------

--
-- Table structure for table `contact_us`
--

DROP TABLE IF EXISTS `contact_us`;
CREATE TABLE IF NOT EXISTS `contact_us` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','in progress','resolved') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`(250)),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `contact_us`
--

INSERT INTO `contact_us` (`id`, `name`, `email`, `message`, `status`, `created_at`, `updated_at`) VALUES
(16, 'John Doe', 'john@gmail.com', 'How can I track my donation after payment?', 'new', '2025-09-16 12:16:20', '2025-09-16 12:16:20'),
(17, 'anna', 'annayip36@gmail.com', 'I can’t log in to my account. Can you help?', 'new', '2025-09-16 12:16:40', '2025-09-16 12:16:40'),
(18, 'Jack', 'jack@gmail.com', 'How secure are the payment transactions?', 'resolved', '2025-09-16 12:17:00', '2025-09-17 00:40:00'),
(19, 'Yip Zheng Qing', 'yipzhengqing36@gmail.com', 'testtesttest', 'resolved', '2025-09-16 19:49:45', '2025-09-16 19:59:27'),
(20, 'Yip Zheng Qing', 'yipzhengqing36@gmail.com', 'where is your company?', 'in progress', '2025-09-16 21:08:56', '2025-09-17 00:38:09');

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
CREATE TABLE IF NOT EXISTS `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `campaign_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `message` text,
  `anonymous` tinyint(1) DEFAULT '0',
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`id`, `user_id`, `campaign_id`, `amount`, `message`, `anonymous`, `payment_status`, `payment_method`, `payment_transaction_id`, `created_at`, `updated_at`) VALUES
(45, 18, 20, 1000.00, NULL, 0, 'completed', 'online', NULL, '2025-09-16 13:12:28', '2025-09-16 13:12:52'),
(46, 18, 20, 100.00, 'test', 0, 'completed', 'online', NULL, '2025-09-16 13:34:54', '2025-09-16 13:35:33'),
(47, 18, 20, 1000.00, NULL, 1, 'completed', 'online', NULL, '2025-09-16 17:57:19', '2025-09-16 17:58:10'),
(48, 18, 22, 500.00, NULL, 0, 'completed', 'online', NULL, '2025-09-16 19:41:52', '2025-09-16 19:42:05'),
(49, 18, 22, 100.00, NULL, 0, 'completed', 'online', NULL, '2025-09-16 19:51:53', '2025-09-16 19:52:06'),
(50, 18, 22, 100.00, NULL, 0, 'completed', 'online', NULL, '2025-09-16 22:37:15', '2025-09-16 22:39:17');

-- --------------------------------------------------------

--
-- Table structure for table `platform_fees`
--

DROP TABLE IF EXISTS `platform_fees`;
CREATE TABLE IF NOT EXISTS `platform_fees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donation_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `donation_id` (`donation_id`)
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `platform_fees`
--

INSERT INTO `platform_fees` (`id`, `donation_id`, `amount`, `created_at`, `updated_at`) VALUES
(23, 50, 6.00, '2025-09-16 22:37:15', '2025-09-16 22:37:15'),
(22, 49, 6.00, '2025-09-16 19:51:53', '2025-09-16 19:51:53'),
(21, 48, 26.00, '2025-09-16 19:41:52', '2025-09-16 19:41:52'),
(20, 47, 51.00, '2025-09-16 17:57:19', '2025-09-16 17:57:19'),
(19, 46, 6.00, '2025-09-16 13:34:54', '2025-09-16 13:34:54'),
(18, 45, 51.00, '2025-09-16 13:12:28', '2025-09-16 13:12:28');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `organization_name` varchar(255) DEFAULT NULL,
  `supporting_document` varchar(500) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `ic_passport_number` varchar(50) DEFAULT NULL,
  `ic_passport_type` enum('ic','passport') DEFAULT 'ic',
  `address` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `role` enum('donor','creator','admin') NOT NULL DEFAULT 'donor',
  `status` enum('pending','active','rejected','suspended') NOT NULL DEFAULT 'pending',
  `rejection_reason` varchar(100) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` timestamp NULL DEFAULT NULL,
  `notifications` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `organization_name`, `supporting_document`, `profile_image`, `phone`, `date_of_birth`, `ic_passport_number`, `ic_passport_type`, `address`, `role`, `status`, `rejection_reason`, `reset_token`, `reset_token_expiry`, `notifications`, `created_at`, `updated_at`) VALUES
(16, 'yipzhengqing36@gmail.com', '$2b$12$unYvI8KB10VVmlFqs5WD/eqnwFXWWFtMrPyrAovdBR/SH8P/hDnWW', 'Zheng Qing', 'Yippppp', NULL, NULL, NULL, NULL, NULL, NULL, 'ic', NULL, 'admin', 'active', NULL, '41e5b30b0d20464bac6b4ef97d2684c88635f0e5902cd5f880f10265e357c1b6', '2025-09-16 23:15:10', 1, '2025-09-16 12:10:47', '2025-09-16 22:15:10'),
(17, 'yipzhengqingc@gmail.com', '$2b$12$abmieLjQ0ENN9DyyCkOUMukFzUzc8pW89pUbDNuFbA1M.GMOPc6P.', 'Zheng Qing', 'Yip', 'MyKasih Foundation', 'https://res.cloudinary.com/ddcpsky6n/raw/upload/v1758025147/sapportlah/documents/dktr5tiyhid6dkrampnk', 'https://ui-avatars.com/api/?name=Zheng Qing&background=3b82f6&color=fff&size=150', '0182128483', '2007-08-28', '070828101111', 'ic', '7-18, Paramount View Condo', 'creator', 'active', NULL, NULL, NULL, 1, '2025-09-16 12:20:01', '2025-09-16 19:56:26'),
(18, 'yipzhengqingd36@gmail.com', '$2b$12$2/L9K7xHXq0k6UMMydL1N.ulE6VZ1QuBcDL52hOxioBsXL0FH8m22', 'Zheng Qing', 'Yippp', NULL, NULL, 'https://res.cloudinary.com/ddcpsky6n/image/upload/v1758029925/sapportlah/campaigns/zg8fcmn5qdfxphvliis8.png', '0182128483', '2003-01-22', '030122102222', 'ic', '7-18, Paramount View Condo', 'donor', 'active', NULL, NULL, NULL, 1, '2025-09-16 12:20:51', '2025-09-16 19:58:47'),
(20, 'john@gmail.com', '$2b$12$AOSzj0bdcRxQ1lASAX5MQOxOSjP55NdZAuI4ibw.1guxpdPOzTsJu', 'John', 'Doe', NULL, NULL, NULL, '0123456789', '2007-09-16', '012345101123', 'ic', '-', 'donor', 'pending', 'no address', NULL, NULL, 1, '2025-09-16 12:24:21', '2025-09-16 21:52:29'),
(21, 'yipzhengqing@gmail.com', '$2b$12$Yg.r8XoqoaieTJCLVOjH3uakdT/QPodMgtCeJGQ7wDf3uQRh47/3O', 'Zheng Qing', 'Yip', 'Asia Pacific University', NULL, NULL, '0182128483', '2007-09-03', '030122101111', 'ic', '7-18, Paramount View Condo', 'donor', 'rejected', 'test', NULL, NULL, 1, '2025-09-16 12:26:09', '2025-09-16 19:58:41'),
(22, 'yipzhengqing361@gmail.com', '$2b$12$5PLmpfI5XYe2G.Opw3TB3OIRW.84W/0KvIBDA4vm1k40D1D2rAOza', 'Zheng Qing', 'Yip', 'Asia Pacific University', NULL, NULL, '0182128483', '2007-09-11', '030122100000', 'ic', '7-18, Paramount View Condo', 'creator', 'suspended', NULL, NULL, NULL, 1, '2025-09-16 12:26:55', '2025-09-16 12:27:08'),
(23, 'yipzhengqingt6@gmail.com', '$2b$12$c6IV1Wdawmxh7Q.D3YvhHOnj7qfheRdu05pn7tSCLSvHP3lN6zFxK', 'Zheng Qing', 'Yip', 'Asia Pacific University', NULL, NULL, '0182128483', '2007-08-29', '030122111111', 'ic', '7-18, Paramount View Condo', 'donor', 'pending', NULL, NULL, NULL, 1, '2025-09-16 22:22:41', '2025-09-16 22:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `campaign_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`campaign_id`),
  KEY `campaign_id` (`campaign_id`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_favorites`
--

INSERT INTO `user_favorites` (`id`, `user_id`, `campaign_id`, `created_at`) VALUES
(32, 18, 20, '2025-09-16 13:13:54');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

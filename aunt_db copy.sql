-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:8889
-- Generation Time: Dec 09, 2025 at 10:49 AM
-- Server version: 8.0.40
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aunt_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int NOT NULL,
  `period_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `position_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','in-progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'in-progress',
  `employee_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_criteria`
--

CREATE TABLE `evaluation_criteria` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `requires_evidence` tinyint(1) NOT NULL DEFAULT '0',
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_criteria`
--

INSERT INTO `evaluation_criteria` (`id`, `name`, `description`, `requires_evidence`, `period_start`, `period_end`, `created_at`, `updated_at`) VALUES
(1, 'การประเมินผลการปฏิบัติงาน (Performance Appraisal)', 'คำอธิบาย (Description) และ เกณฑ์การให้คะแนน (Scoring Criteria)', 1, '2025-12-02', '2025-12-15', '2025-12-03 03:49:27', '2025-12-03 08:06:59'),
(6, 'KPI (Key Performance Indicators)', '3 ด้าน ซึ่งจะเน้นการวัดผลที่เป็น ตัวเลข และ จับต้องได้ มากกว่าหัวข้อประเมินพฤติกรรมครับ เหมาะสำหรับการนำไปใช้ในระบบ Web App ที่ต้องการคำนวณคะแนนแบบเป็นรูปธรรม', 0, NULL, NULL, '2025-12-03 08:16:31', '2025-12-03 08:18:03');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_employee_criteria`
--

CREATE TABLE `evaluation_employee_criteria` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `criteria_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `evaluation_employee_criteria`
--

INSERT INTO `evaluation_employee_criteria` (`id`, `user_id`, `criteria_id`) VALUES
(26, 3, 1),
(27, 3, 6),
(23, 4, 1),
(24, 5, 1),
(25, 5, 6);

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_periods`
--

CREATE TABLE `evaluation_periods` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('draft','active','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_periods`
--

INSERT INTO `evaluation_periods` (`id`, `name`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(5, 'รอบการประเมินอัตโนมัติ', '2025-12-03', '2026-03-03', 'active', '2025-12-03 09:37:11', '2025-12-03 09:37:11');

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_scores`
--

CREATE TABLE `evaluation_scores` (
  `id` int NOT NULL,
  `evaluation_id` int NOT NULL,
  `subitem_id` int NOT NULL,
  `self_score` tinyint DEFAULT NULL,
  `supervisor_score` tinyint DEFAULT NULL,
  `document_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evaluation_subitems`
--

CREATE TABLE `evaluation_subitems` (
  `id` int NOT NULL,
  `criteria_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` enum('score','document') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'score',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evaluation_subitems`
--

INSERT INTO `evaluation_subitems` (`id`, `criteria_id`, `name`, `item_type`, `created_at`, `updated_at`) VALUES
(57, 1, '1. คุณภาพและผลสำเร็จของงาน (Quality & Achievement)', 'score', '2025-12-03 08:06:59', '2025-12-03 08:06:59'),
(58, 1, '2. การแก้ไขปัญหาและความคิดริเริ่ม (Problem Solving & Initiative)', 'score', '2025-12-03 08:06:59', '2025-12-03 08:06:59'),
(59, 1, '3. การทำงานเป็นทีมและการสื่อสาร (Teamwork & Communication)', 'score', '2025-12-03 08:06:59', '2025-12-03 08:06:59'),
(63, 6, '1. การบรรลุเป้าหมายตามยอดที่กำหนด (Achievement of Targets)', 'score', '2025-12-03 08:18:03', '2025-12-03 08:18:03'),
(64, 6, '2. อัตราความถูกต้องของงาน (Quality & Error Rate)', 'score', '2025-12-03 08:18:03', '2025-12-03 08:18:03'),
(65, 6, '3. ความตรงต่อเวลาในการส่งมอบงาน (On-Time Delivery)', 'score', '2025-12-03 08:18:03', '2025-12-03 08:18:03');

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `position` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `avatar_url` longtext COLLATE utf8mb3_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `full_name`, `email`, `position`, `avatar_url`, `created_at`, `updated_at`) VALUES
(1, 3, 'นนทชัย ไชยวงศ์', 'nontachai15229@gmail.com', 'งานสารสนเทศ', 'data:image/png;base64,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', '2025-12-01 09:41:23', '2025-12-01 09:41:56'),
(4, 4, 'usertest', 'ceo123', 'accoounting', '', '2025-12-03 08:14:11', '2025-12-03 08:14:11'),
(5, 5, 'ethan', 'crazy', 'งานสารสนเทศ', '', '2025-12-03 08:27:16', '2025-12-03 08:27:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `role` enum('user','admin','assessor') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(1, 'testUser', '$2b$10$bDwPy31AGvPlz0TZJoTDpebSx3Glq7KMVNVSPRNi9ueRzCNcULBYW', 'user'),
(2, 'test', '$2b$10$hQ.o6A4b7aLz538yyDg0LO0i2YIumH.6BaPXTAhfFI8FgBXl74B4G', 'admin'),
(3, 'user', '$2b$10$/IjA5eIeWDbPMb5W2HGMJulhsRB6p757/ZC5Wzwb/jqhYATJldtJO', 'user'),
(4, 'user1', '$2b$10$RffvX3wI.yN6UMmwDZdOq.iIXpy..nopI1x1tSvNTGgFzSCnD9NCy', 'user'),
(5, 'user2', '$2b$10$BPcE87GJ.Yqe3n1hc9odvuxLdiRYWRMgigzPbhC/uy01L4O2ySWxC', 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_evaluations_period` (`period_id`),
  ADD KEY `fk_evaluations_employee` (`employee_id`);

--
-- Indexes for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation_employee_criteria`
--
ALTER TABLE `evaluation_employee_criteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_employee_criteria` (`user_id`,`criteria_id`);

--
-- Indexes for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `evaluation_scores`
--
ALTER TABLE `evaluation_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_scores_evaluation` (`evaluation_id`),
  ADD KEY `fk_scores_subitem` (`subitem_id`);

--
-- Indexes for table `evaluation_subitems`
--
ALTER TABLE `evaluation_subitems`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subitems_criteria` (`criteria_id`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_profile` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_criteria`
--
ALTER TABLE `evaluation_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `evaluation_employee_criteria`
--
ALTER TABLE `evaluation_employee_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `evaluation_periods`
--
ALTER TABLE `evaluation_periods`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `evaluation_scores`
--
ALTER TABLE `evaluation_scores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evaluation_subitems`
--
ALTER TABLE `evaluation_subitems`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `fk_evaluations_employee` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_evaluations_period` FOREIGN KEY (`period_id`) REFERENCES `evaluation_periods` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `evaluation_scores`
--
ALTER TABLE `evaluation_scores`
  ADD CONSTRAINT `fk_scores_evaluation` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_scores_subitem` FOREIGN KEY (`subitem_id`) REFERENCES `evaluation_subitems` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `evaluation_subitems`
--
ALTER TABLE `evaluation_subitems`
  ADD CONSTRAINT `fk_subitems_criteria` FOREIGN KEY (`criteria_id`) REFERENCES `evaluation_criteria` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `fk_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

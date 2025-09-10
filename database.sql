-- Xóa các bảng cũ nếu chúng tồn tại (theo thứ tự ngược lại của khóa ngoại)
DROP TABLE IF EXISTS `message_statuses`;
DROP TABLE IF EXISTS `conversation_participants`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversations`;
DROP TABLE IF EXISTS `end_users`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `projects`;

-- Bảng `projects`: Quản lý các website/dự án nguồn
CREATE TABLE `projects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_name` VARCHAR(100) NOT NULL COMMENT 'Tên đầy đủ của dự án, ví dụ: Phao Sinh Viên',
    `project_code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã định danh duy nhất, ví dụ: psv, mdt',
    `website_url` VARCHAR(255) COMMENT 'URL của website liên kết',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `admins`: Quản lý tài khoản của các quản trị viên
CREATE TABLE `admins` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100),
    `avatar_url` VARCHAR(512) NULL COMMENT 'URL tới ảnh đại diện của admin',
    `email` VARCHAR(100) UNIQUE,
    `gender` ENUM('male', 'female', 'other') NULL COMMENT 'Giới tính',
    `date_of_birth` DATE NULL COMMENT 'Ngày tháng năm sinh',
    `phone_number` VARCHAR(20) NULL UNIQUE,
    `facebook_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `end_users`: Quản lý người dùng cuối (khách truy cập website)
CREATE TABLE `end_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `session_id` VARCHAR(255) NOT NULL UNIQUE COMMENT 'ID phiên duy nhất để định danh người dùng ẩn danh',
    `display_name` VARCHAR(100) COMMENT 'Tên hiển thị người dùng tự nhập',
    `email` VARCHAR(100) COMMENT 'Email người dùng tự nhập',
    `project_id` INT NOT NULL COMMENT 'Người dùng này đến từ dự án nào',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `conversations`: Quản lý các cuộc hội thoại
CREATE TABLE `conversations` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL COMMENT 'Hội thoại này thuộc dự án nào',
    `end_user_id` INT NULL COMMENT 'Liên kết với người dùng cuối (nếu là chat với khách)',
    `title` VARCHAR(255) COMMENT 'Tiêu đề cuộc hội thoại, có thể là tin nhắn đầu tiên',
    `status` ENUM('open', 'closed', 'pending') DEFAULT 'open' COMMENT 'Trạng thái: đang mở, đã đóng, đang chờ',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_message_at` TIMESTAMP NULL COMMENT 'Thời gian của tin nhắn cuối cùng để sắp xếp',
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`end_user_id`) REFERENCES `end_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `messages`: Lưu trữ tất cả các tin nhắn
CREATE TABLE `messages` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `conversation_id` INT NOT NULL,
    `sender_admin_id` INT NULL COMMENT 'ID của admin gửi tin',
    `sender_end_user_id` INT NULL COMMENT 'ID của người dùng cuối gửi tin',
    
    `message_type` ENUM('text', 'image', 'video', 'file') NOT NULL DEFAULT 'text' COMMENT 'Loại tin nhắn',
    `content` TEXT NULL COMMENT 'Nội dung text hoặc caption cho file',
    `file_url` VARCHAR(512) NULL COMMENT 'URL tới file đã tải lên (image, video, etc.)',
    `file_metadata` JSON NULL COMMENT 'Thông tin meta của file: { "fileName": "abc.jpg", "fileSize": 12345, "mimeType": "image/jpeg" }',

    `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`sender_admin_id`) REFERENCES `admins`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`sender_end_user_id`) REFERENCES `end_users`(`id`) ON DELETE SET NULL,
    INDEX `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `conversation_participants`: Quản lý việc admin nào tham gia vào cuộc hội thoại nào
CREATE TABLE `conversation_participants` (
    `conversation_id` INT NOT NULL,
    `admin_id` INT NOT NULL,
    `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`conversation_id`, `admin_id`),
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng `message_statuses`: Theo dõi trạng thái (đã nhận, đã đọc) của mỗi tin nhắn cho từng người nhận
CREATE TABLE `message_statuses` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `message_id` BIGINT NOT NULL,
    `recipient_admin_id` INT NULL COMMENT 'ID của admin người nhận',
    `recipient_end_user_id` INT NULL COMMENT 'ID của người dùng cuối người nhận',
    `status` ENUM('delivered', 'read') NOT NULL DEFAULT 'delivered' COMMENT 'Trạng thái: đã tới máy người nhận, đã đọc',
    `read_at` TIMESTAMP NULL COMMENT 'Thời điểm tin nhắn được đọc',
    `delivered_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời điểm tin nhắn được giao',
    FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recipient_admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`recipient_end_user_id`) REFERENCES `end_users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_status_per_recipient` (`message_id`, `recipient_admin_id`),
    CONSTRAINT `chk_recipient` CHECK (`recipient_admin_id` IS NOT NULL OR `recipient_end_user_id` IS NOT NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DD Computer Database Initialization Script
-- MySQL Database - Complete Schema

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS dd_computer
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE dd_computer;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'banned', 'muted') DEFAULT 'active',
    avatar VARCHAR(255),
    last_online TIMESTAMP NULL DEFAULT NULL,
    is_online BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_online (is_online)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    type ENUM('notebook', 'pc') DEFAULT 'pc',
    brand VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_name (name),
    INDEX idx_price (price),
    INDEX idx_stock (stock),
    INDEX idx_created_at (created_at),
    INDEX idx_type (type),
    INDEX idx_brand (brand),
    FULLTEXT INDEX ft_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(512) NOT NULL,
    product_id INT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_cart (cart_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, product_id),
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_review (user_id, product_id),
    INDEX idx_product (product_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(50),
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Product Views Table
CREATE TABLE IF NOT EXISTS product_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_ip (ip_address),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'completed', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Stock Logs Table
CREATE TABLE IF NOT EXISTS stock_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    quantity INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings Table for Admin Panel
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_key_name (key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Login Attempts Table (for rate limiting and account lock)
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    attempts INT DEFAULT 1,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    locked_until TIMESTAMP NULL,
    ip VARCHAR(45),
    INDEX idx_email (email),
    INDEX idx_locked (locked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Login Logs Table (for security auditing)
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    email VARCHAR(255) NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    status ENUM('success', 'failed', 'locked') NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password Resets Table (for forgot password feature)
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User Sessions Table (for session management)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    device_info VARCHAR(255),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Default Admin User (password: admin123)
INSERT INTO users (name, email, password, role, status) 
VALUES ('Admin User', 'admin@example.com', '$2b$10$7FXjuqDixtMXIP.ULXWpIOIW6qLiG.5L5nVK/FsmVtJTXtA4zSoqK', 'admin', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Insert Sample Categories
INSERT INTO categories (name, description) VALUES
('CPU', 'Processors for computers'),
('GPU', 'Graphics cards for gaming and work'),
('RAM', 'Memory modules'),
('SSD', 'Solid state drives'),
('HDD', 'Hard disk drives'),
('Motherboard', 'Main circuit boards'),
('Power Supply', 'PSU units'),
('Monitor', 'Computer Monitor / Gaming Display'),
('Notebook', 'โน้ตบุ๊ก'),
('PC ประกอบ', 'คอมพิวเตอร์ประกอบ Gaming PC และ Workstation'),
('อุปกรณ์เสริม', 'อุปกรณ์เสริมคอมพิวเตอร์ Keyboard Mouse Headset Webcam')
ON DUPLICATE KEY UPDATE name=name;

-- Insert Sample Products
INSERT INTO products (name, description, price, stock, category_id, status, created_by) VALUES
('Intel Core i9-13900K', 'Latest Intel processor with 24 cores, 32 threads, 5.8GHz max boost', 18999.00, 50, 1, 'active', 1),
('AMD Ryzen 9 7950X', 'AMD flagship processor with 16 cores, 32 threads, 5.7GHz max boost', 17999.00, 45, 1, 'active', 1),
('NVIDIA RTX 4090', 'Top-tier graphics card with 24GB GDDR6X memory', 59999.00, 30, 2, 'active', 1),
('AMD Radeon RX 7900 XTX', 'High-end AMD GPU with 24GB GDDR6 memory', 44999.00, 25, 2, 'active', 1),
('Corsair Vengeance 32GB DDR5', '32GB DDR5-6000 RAM kit (2x16GB)', 2499.00, 100, 3, 'active', 1),
('Samsung 990 Pro 2TB', 'NVMe SSD with 7450MB/s read speed', 4599.00, 80, 4, 'active', 1),
('WD Black SN850X 1TB', 'High-performance NVMe SSD with 7300MB/s read', 2599.00, 90, 4, 'active', 1),
('Seagate Barracuda 4TB', '3.5" HDD with 7200RPM spin speed', 1499.00, 60, 5, 'active', 1),
('ASUS ROG Maximus Z790', 'Premium Intel Z790 motherboard with WiFi 6E', 12999.00, 35, 6, 'active', 1),
('MSI MPG B650 Carbon', 'AMD AM5 motherboard with PCIe 5.0 support', 8999.00, 40, 6, 'active', 1),
('Corsair RM1000x', '1000W 80+ Gold fully modular power supply', 5499.00, 55, 7, 'active', 1),
('Seasonic Focus GX-850', '850W 80+ Gold fully modular PSU', 4299.00, 65, 7, 'active', 1)
ON DUPLICATE KEY UPDATE name=name;

-- Insert default settings
INSERT INTO settings (key_name, value, description) VALUES
('site_name', 'DD Computer', 'ชื่อเว็บไซต์'),
('currency', 'THB', 'สกุลเงิน'),
('tax_rate', '7', 'อัตราภาษี (%)'),
('theme', 'dark', 'ธีมเว็บไซต์'),
('contact_email', 'contact@ddcomputer.com', 'อีเมลติดต่อ'),
('contact_phone', '02-123-4567', 'เบอร์โทรศัพท์'),
('contact_address', 'กรุงเทพฯ ประเทศไทย', 'ที่อยู่'),
('social_facebook', '', 'Facebook'),
('social_instagram', '', 'Instagram'),
('social_line', '', 'LINE')
ON DUPLICATE KEY UPDATE key_name=key_name;

-- Repairs Table (รายการซ่อม)
CREATE TABLE IF NOT EXISTS repairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    device_type VARCHAR(100),
    status ENUM('completed', 'in_progress', 'pending') DEFAULT 'completed',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Repair Images Table (รูปภาพก่อน/หลังซ่อม)
CREATE TABLE IF NOT EXISTS repair_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    repair_id INT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    image_type ENUM('before', 'after', 'during') DEFAULT 'after',
    caption VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repair_id) REFERENCES repairs(id) ON DELETE CASCADE,
    INDEX idx_repair (repair_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conversations Table (สำหรับระบบแชท)
CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    admin_id INT NOT NULL,
    product_id INT,
    status ENUM('active', 'closed', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_admin (admin_id),
    INDEX idx_status (status),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages Table (ข้อความในการแชท)
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created (created_at),
    INDEX idx_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

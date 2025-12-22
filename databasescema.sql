SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. DROP EXISTING TABLES (Clean Slate)
-- --------------------------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS food_prices;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS merchant_portions;
DROP TABLE IF EXISTS portion_categories;
DROP TABLE IF EXISTS merchants;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS universities;
DROP TABLE IF EXISTS system_settings; 

-- --------------------------------------------------------
-- 2. CREATE UNIVERSITIES
-- --------------------------------------------------------
CREATE TABLE universities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 3. CREATE USERS
-- --------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'merchant', 'customer') NOT NULL DEFAULT 'customer',
    approved TINYINT(1) DEFAULT 0,
    university_id INT DEFAULT NULL,
    google_id VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 4. CREATE MERCHANTS
-- (Includes the 'active_meal_time' column we fixed)
-- --------------------------------------------------------
CREATE TABLE merchants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    store_name VARCHAR(255) NOT NULL,
    store_address TEXT NOT NULL,
    university_id INT NOT NULL,
    website_charge DECIMAL(10,2) DEFAULT 0.00,
    is_open TINYINT(1) DEFAULT 0,
    accepting_orders TINYINT(1) DEFAULT 0,
    order_limit INT DEFAULT 0,
    closing_time TIME DEFAULT NULL,
    active_meal_time VARCHAR(20) DEFAULT 'Lunch', -- ✅ Added Back
    approved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 5. CREATE PORTION CATEGORIES
-- (Unused but kept for backend compatibility)
-- --------------------------------------------------------
CREATE TABLE portion_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 6. CREATE MERCHANT PORTIONS
-- --------------------------------------------------------
CREATE TABLE merchant_portions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    portion_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 7. CREATE FOODS
-- --------------------------------------------------------
CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    available TINYINT(1) DEFAULT 1,
    food_type VARCHAR(50) NOT NULL, -- e.g. 'Rice', 'Kottu'
    is_veg TINYINT(1) DEFAULT 0,
    is_divisible TINYINT(1) DEFAULT 0,
    extra_piece_price DECIMAL(10,2) DEFAULT 0.00,
    price DECIMAL(10,2) DEFAULT NULL, -- Unused legacy column
    category VARCHAR(255) DEFAULT NULL, -- Unused legacy column
    meal_time VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 8. CREATE FOOD PRICES
-- (Links via 'portion_name' string)
-- --------------------------------------------------------
CREATE TABLE food_prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT NOT NULL,
    portion_name VARCHAR(255) NOT NULL, 
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 9. CREATE ORDERS
-- --------------------------------------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    merchant_id INT NOT NULL,
    meal_count INT DEFAULT 0,
    meal_total DECIMAL(10,2) DEFAULT 0.00,
    website_charge DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'pending',
    meal_time VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 10. CREATE ORDER ITEMS
-- --------------------------------------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE merchants
ADD COLUMN free_veg_curries_count INT DEFAULT 0 AFTER active_meal_time,
ADD COLUMN veg_curry_price DECIMAL(10,2) DEFAULT 0.00 AFTER free_veg_curries_count;
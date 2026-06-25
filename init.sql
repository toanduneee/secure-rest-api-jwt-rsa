-- Tạo bảng phân quyền (roles)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Tạo bảng người dùng (users)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo bảng trung gian nhiều-nhiều (user_roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 1. Tạo 2 quyền cơ bản
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Quản trị viên hệ thống'), 
('USER', 'Người dùng thông thường');

-- 2. Tạo tài khoản
INSERT INTO users (username, password, is_active) VALUES 
('admin', 'admin123', TRUE),         -- id = 1
('toan_at20', 'password123', TRUE),  -- id = 2
('hung_at20', 'password123', TRUE),  
('diu_at20', 'password123', TRUE),   
('test', '123456', TRUE);

-- 3. Phân quyền cho từng tài khoản
INSERT INTO user_roles (user_id, role_id) VALUES 
(1, 1), -- user 'admin' có quyền ADMIN (role_id = 1)
(2, 2), -- user 'toan_at20' có quyền USER (role_id = 2)
(3, 2), 
(4, 2), 
(5, 2);
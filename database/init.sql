CREATE DATABASE IF NOT EXISTS three_tier_db;

USE three_tier_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email)
SELECT 'Srinivasan', 'srinivasan@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'srinivasan@example.com'
);

INSERT INTO users (name, email)
SELECT 'John', 'john@example.com'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'john@example.com'
);

DROP DATABASE IF EXISTS itis_5166_final_project;

CREATE DATABASE itis_5166_final_project;

USE itis_5166_final_project;

CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) NOT NULL UNIQUE CHECK (LENGTH(TRIM(username)) > 0),
    password VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(password)) > 0)
);

CREATE TABLE budget (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL UNIQUE CHECK (TRIM(name) <> ''),
    amount DECIMAL(13, 2) NOT NULL,
    UNIQUE (user_id, name),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

CREATE TABLE expense (
    id INT PRIMARY KEY AUTO_INCREMENT,
    budget_id INT NOT NULL,
    amount DECIMAL(13, 2) NOT NULL,
    month TINYINT NOT NULL CHECK (
        month >= 1
        AND month <= 12
    ),
    UNIQUE (budget_id, date),
    FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE,
    INDEX idx_budget_id (budget_id)
);

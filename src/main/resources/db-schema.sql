-- ==================== DATABASE SCHEMA ====================
-- SQL script to create tables for Expense-Tracker application
-- Run this script on your Aiven MySQL database

create table users(
id BIGINT auto_increment primary key,
username varchar(50) not null unique,
email varchar(100) not null unique,
password varchar(255) not null,
created_at timestamp default current_timestamp
);

create table expence(
id BIGINT auto_increment primary key,
user_id bigint Not null,
title varchar(100) not null,
category varchar(50),
amount Decimal(10,2) not null,
expense_date date not null,
note text,
created_at timestamp default current_timestamp,
foreign key (user_id) references users(id) on delete cascade
);

CREATE TABLE income(
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT NOT NULL,
title VARCHAR(100) NOT NULL,
category VARCHAR(50),
amount DECIMAL(10,2) NOT NULL,
income_date DATE NOT NULL,
note TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

create table refresh_tokens(
id BIGINT auto_increment primary key,
user_id bigint not null,
token varchar(500) not null unique,
expiry_date timestamp not null,
create_at timestamp default current_timestamp,
foreign key (user_id) references users(id) on delete cascade
);

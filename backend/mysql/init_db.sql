create database db_init;
use db_init;

CREATE TABLE user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin','student') NOT NULL DEFAULT 'student',
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profile_student (
    user_id INT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,

    CONSTRAINT fk_profile_user
        FOREIGN KEY (user_id)
        REFERENCES user(user_id)
        ON DELETE CASCADE
);

CREATE TABLE courts (
    court_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    status ENUM('available','maintenance','closed') DEFAULT 'available',
    type VARCHAR(50),
    max_pp INT NOT NULL
);

CREATE TABLE TimeSlot (
    time_id INT AUTO_INCREMENT PRIMARY KEY,
    court_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    CONSTRAINT fk_timeslot_court
        FOREIGN KEY (court_id)
        REFERENCES courts(court_id)
        ON DELETE CASCADE
);

CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    court_id INT NOT NULL,
    date DATE NOT NULL,
    time_id INT NOT NULL,
    status ENUM('active','cancelled') DEFAULT 'active',
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES user(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_court
        FOREIGN KEY (court_id)
        REFERENCES courts(court_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_time
        FOREIGN KEY (time_id)
        REFERENCES TimeSlot(time_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_booking UNIQUE (court_id, date, time_id)
);


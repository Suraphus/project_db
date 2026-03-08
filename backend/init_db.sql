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
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,

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
    img_url VARCHAR(255),
    surface VARCHAR(50),
    max_pp INT NOT NULL  
);

CREATE TABLE time_slot (
    time_slot_id INT AUTO_INCREMENT PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE lobby_time_slot (
    lobby_time_id INT AUTO_INCREMENT PRIMARY KEY,
    court_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    date DATE NOT NULL,
    cur_pp INT NOT NULL DEFAULT 0,  
    max_pp INT NOT NULL,  
    
    CONSTRAINT fk_lobby_court
        FOREIGN KEY (court_id)
        REFERENCES courts(court_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_lobby_time_slot
        FOREIGN KEY (time_slot_id)
  
        REFERENCES time_slot(time_slot_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_lobby_time UNIQUE (court_id, date, time_slot_id)
);

CREATE TABLE booking (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    court_id INT NOT NULL,
    lobby_time_id INT NOT NULL,
    status ENUM('active','cancelled') DEFAULT 'active',
    date DATE NOT NULL,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES user(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_court
        FOREIGN KEY (court_id)
        REFERENCES courts(court_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_booking_lobby_time
        FOREIGN KEY (lobby_time_id)
        REFERENCES lobby_time_slot(lobby_time_id)
        ON DELETE CASCADE,

    CONSTRAINT unique_booking UNIQUE (user_id, lobby_time_id)
);


DELIMITER $$


CREATE TRIGGER set_max_pp_in_lobby_time_slot
BEFORE INSERT ON lobby_time_slot
FOR EACH ROW
BEGIN
    DECLARE court_max_pp INT;
    
    
    SELECT max_pp INTO court_max_pp
    FROM courts
    WHERE court_id = NEW.court_id;
    
    
    SET NEW.max_pp = court_max_pp;
END $$


CREATE TRIGGER update_cur_pp_after_booking
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    UPDATE lobby_time_slot
    SET cur_pp = cur_pp + 1
    WHERE lobby_time_id = NEW.lobby_time_id;
END $$


CREATE TRIGGER update_cur_pp_after_delete
AFTER DELETE ON booking
FOR EACH ROW
BEGIN
    UPDATE lobby_time_slot
    SET cur_pp = cur_pp - 1
    WHERE lobby_time_id = OLD.lobby_time_id;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE make_booking(
    IN p_user_id INT,
    IN p_court_id INT,
    IN p_time_slot_id INT,
    IN p_date DATE
)
BEGIN
    DECLARE v_lobby_time_id INT;
    DECLARE v_cur_pp INT;
    DECLARE v_max_pp INT;

    START TRANSACTION;

    SELECT lobby_time_id, cur_pp, max_pp 
    INTO v_lobby_time_id, v_cur_pp, v_max_pp
    FROM lobby_time_slot 
    WHERE court_id = p_court_id 
      AND time_slot_id = p_time_slot_id 
      AND date = p_date
    FOR UPDATE;

    IF v_lobby_time_id IS NULL THEN
        INSERT INTO lobby_time_slot (court_id, time_slot_id, date)
        VALUES (p_court_id, p_time_slot_id, p_date);
        
        SET v_lobby_time_id = LAST_INSERT_ID();
        
        SELECT cur_pp, max_pp INTO v_cur_pp, v_max_pp
        FROM lobby_time_slot 
        WHERE lobby_time_id = v_lobby_time_id;
    END IF;

    IF v_cur_pp >= v_max_pp THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking failed: The court is already full for this time slot.';
    ELSE
        
        INSERT INTO booking (user_id, court_id, lobby_time_id, date)
        VALUES (p_user_id, p_court_id, v_lobby_time_id, p_date);
        
        COMMIT;
    END IF;

END $$

DELIMITER ;

-- =====================================================
-- PLACEMENT_TRACKER
-- =====================================================

DROP DATABASE IF EXISTS `placement_tracker`;
CREATE DATABASE `placement_tracker` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `placement_tracker`;

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE Student (
    Student_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(20),
    Degree VARCHAR(50) NOT NULL,
    Branch VARCHAR(50) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_branch (Branch),
    INDEX idx_email (Email)
) ENGINE=InnoDB;

CREATE TABLE Company (
    Company_ID INT AUTO_INCREMENT PRIMARY KEY,
    Company_Name VARCHAR(150) NOT NULL UNIQUE,
    Industry VARCHAR(100),
    Location VARCHAR(100),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_industry (Industry)
) ENGINE=InnoDB;

CREATE TABLE Job_Position (
    Position_ID INT AUTO_INCREMENT PRIMARY KEY,
    Company_ID INT NOT NULL,
    Role VARCHAR(150) NOT NULL,
    Eligibility VARCHAR(255),
    Package DECIMAL(10,2) NOT NULL CHECK (Package >= 0),
    Min_CGPA DECIMAL(3,2) DEFAULT 0.00 CHECK (Min_CGPA >= 0 AND Min_CGPA <= 10),
    Max_Backlogs INT DEFAULT 0 CHECK (Max_Backlogs >= 0),
    Is_Active BOOLEAN DEFAULT TRUE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jobposition_company FOREIGN KEY (Company_ID)
        REFERENCES Company(Company_ID) ON DELETE CASCADE,
    INDEX idx_company (Company_ID),
    INDEX idx_active (Is_Active)
) ENGINE=InnoDB;

CREATE TABLE Academic_Record (
    Record_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL UNIQUE,
    CGPA DECIMAL(3,2) NOT NULL CHECK (CGPA >= 0 AND CGPA <= 10),
    Backlogs INT DEFAULT 0 CHECK (Backlogs >= 0),
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_academic_student FOREIGN KEY (Student_ID)
        REFERENCES Student(Student_ID) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE Application_Status (
    Application_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL,
    Position_ID INT NOT NULL,
    Date_of_Application TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Current_Status ENUM('Applied', 'Not Eligible', 'Interview Scheduled', 'Under Review', 
                        'Offered', 'Accepted', 'Rejected', 'Withdrawn') 
                   NOT NULL DEFAULT 'Applied',
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_position UNIQUE (Student_ID, Position_ID),
    CONSTRAINT fk_app_student FOREIGN KEY (Student_ID)
        REFERENCES Student(Student_ID) ON DELETE CASCADE,
    CONSTRAINT fk_app_position FOREIGN KEY (Position_ID)
        REFERENCES Job_Position(Position_ID) ON DELETE CASCADE,
    INDEX idx_student (Student_ID),
    INDEX idx_position (Position_ID),
    INDEX idx_status (Current_Status)
) ENGINE=InnoDB;

CREATE TABLE Interview (
    Interview_ID INT AUTO_INCREMENT PRIMARY KEY,
    Application_ID INT NOT NULL,
    Round_Number INT NOT NULL CHECK (Round_Number > 0),
    Date_Time DATETIME NOT NULL,
    Mode ENUM('Online', 'Offline', 'Hybrid') DEFAULT 'Online',
    Result ENUM('Pending', 'Passed', 'Failed', 'Cancelled') DEFAULT 'Pending',
    Feedback TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_app FOREIGN KEY (Application_ID)
        REFERENCES Application_Status(Application_ID) ON DELETE CASCADE,
    INDEX idx_application (Application_ID),
    INDEX idx_datetime (Date_Time)
) ENGINE=InnoDB;

CREATE TABLE Offer (
    Offer_ID INT AUTO_INCREMENT PRIMARY KEY,
    Application_ID INT NOT NULL UNIQUE,
    Company_ID INT NOT NULL,
    Position_ID INT NOT NULL,
    Package DECIMAL(10,2) NOT NULL CHECK (Package >= 0),
    Offer_Status ENUM('Pending', 'Accepted', 'Rejected', 'Expired') NOT NULL DEFAULT 'Pending',
    Offer_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Response_Date TIMESTAMP NULL,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_offer_app FOREIGN KEY (Application_ID)
        REFERENCES Application_Status(Application_ID) ON DELETE CASCADE,
    CONSTRAINT fk_offer_company FOREIGN KEY (Company_ID)
        REFERENCES Company(Company_ID) ON DELETE CASCADE,
    CONSTRAINT fk_offer_position FOREIGN KEY (Position_ID)
        REFERENCES Job_Position(Position_ID) ON DELETE CASCADE,
    INDEX idx_status (Offer_Status)
) ENGINE=InnoDB;

CREATE TABLE Comment (
    Comment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Application_ID INT NOT NULL,
    Interview_ID INT NULL,
    Comment_Text TEXT NOT NULL,
    Comment_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_app FOREIGN KEY (Application_ID)
        REFERENCES Application_Status(Application_ID) ON DELETE CASCADE,
    CONSTRAINT fk_comment_interview FOREIGN KEY (Interview_ID)
        REFERENCES Interview(Interview_ID) ON DELETE SET NULL,
    INDEX idx_application (Application_ID),
    INDEX idx_date (Comment_Date)
) ENGINE=InnoDB;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

INSERT INTO Company (Company_Name, Industry, Location) VALUES
('AlphaTech Solutions', 'Software', 'Bangalore'),
('GreenEnergy LLC', 'Renewables', 'Hyderabad'),
('FinCorp', 'Finance', 'Mumbai');

INSERT INTO Student (Name, Email, Phone, Degree, Branch) VALUES
('Aman Kumar', 'aman.k@example.com', '9000000001', 'B.Tech', 'CSE'),
('Chinmay Patel', 'chinmay.p@example.com', '9000000003', 'B.Tech', 'CSE'),
('Neha Sharma', 'neha.s@example.com', '9000000010', 'B.Tech', 'CSE'),
('Riya Mehta', 'riya.m@example.com', '9000000011', 'B.Tech', 'AI/ML'),
('Arjun Verma', 'arjun.v@example.com', '9000000012', 'B.Tech', 'AI/ML'),
('Bhavya Rao', 'bhavya.r@example.com', '9000000002', 'B.Tech', 'EEE'),
('Evan Thomas', 'evan.t@example.com', '9000000005', 'B.Tech', 'EEE'),
('Divya Singh', 'divya.s@example.com', '9000000004', 'B.Tech', 'ME'),
('Siddharth Jain', 'siddharth.j@example.com', '9000000013', 'B.Tech', 'ECE');

INSERT INTO Job_Position (Company_ID, Role, Eligibility, Package, Min_CGPA, Max_Backlogs) VALUES
(1, 'Software Engineer Intern', 'CSE/IT/AI Students', 15000.00, 7.0, 0),
(1, 'Full Stack Developer', 'CSE/IT/AI Students', 20000.00, 7.5, 0),
(2, 'Power Systems Intern', 'EEE/ME Students', 9000.00, 6.5, 1),
(2, 'Energy Analyst', 'EEE/ME Students', 12000.00, 7.0, 0),
(3, 'Finance Intern', 'Finance Students', 10000.00, 7.0, 0),
(3, 'Data Analyst', 'CSE/AI Students', 18000.00, 7.0, 0);

INSERT INTO Academic_Record (Student_ID, CGPA, Backlogs) VALUES
(1, 8.1, 0), (2, 7.2, 0), (3, 7.8, 0), (4, 6.9, 1), (5, 8.5, 0),
(6, 8.0, 0), (7, 7.9, 0), (8, 8.2, 0), (9, 7.6, 0);

INSERT INTO Offer(Application_ID, Company_ID, Position_ID, Package, Offer_Status) VALUES 
(p_Application_ID, v_Company_ID, v_Position_ID, v_Package, 'Pending')

-- =====================================================
-- FUNCTIONS
-- =====================================================

DELIMITER $$

DROP FUNCTION IF EXISTS CheckEligibility$$
CREATE FUNCTION CheckEligibility(p_Student_ID INT, p_Position_ID INT) 
RETURNS BOOLEAN
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE s_cgpa DECIMAL(3,2);
    DECLARE s_backlogs INT;
    DECLARE jp_cgpa DECIMAL(3,2);
    DECLARE jp_backlogs INT;
    DECLARE position_active BOOLEAN;

    -- Check if position is active
    SELECT Is_Active INTO position_active
    FROM Job_Position 
    WHERE Position_ID = p_Position_ID;
    
    IF NOT position_active THEN
        RETURN FALSE;
    END IF;

    -- Get student academic details
    SELECT CGPA, Backlogs INTO s_cgpa, s_backlogs
    FROM Academic_Record 
    WHERE Student_ID = p_Student_ID;

    -- Get position requirements
    SELECT Min_CGPA, Max_Backlogs INTO jp_cgpa, jp_backlogs
    FROM Job_Position 
    WHERE Position_ID = p_Position_ID;

    RETURN (s_cgpa >= jp_cgpa AND s_backlogs <= jp_backlogs);
END$$

DELIMITER ;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS GetPlacementStatsByBranch$$
CREATE PROCEDURE GetPlacementStatsByBranch()
BEGIN
    SELECT 
        s.Branch,
        COUNT(DISTINCT s.Student_ID) AS Total_Students,
        COUNT(DISTINCT CASE 
            WHEN a.Current_Status IN ('Offered', 'Accepted') 
            THEN a.Student_ID 
        END) AS Students_With_Offers,
        ROUND(COUNT(DISTINCT CASE 
            WHEN a.Current_Status IN ('Offered', 'Accepted') 
            THEN a.Student_ID 
        END) * 100.0 / COUNT(DISTINCT s.Student_ID), 2) AS Placement_Percentage,
        COUNT(DISTINCT a.Application_ID) AS Total_Applications,
        ROUND(AVG(CASE 
            WHEN o.Offer_Status IN ('Pending', 'Accepted') 
            THEN o.Package 
        END), 2) AS Avg_Package_Offered,
        MAX(o.Package) AS Highest_Package
    FROM Student s
    LEFT JOIN Application_Status a ON s.Student_ID = a.Student_ID
    LEFT JOIN Offer o ON a.Application_ID = o.Application_ID
    GROUP BY s.Branch
    ORDER BY Placement_Percentage DESC, Students_With_Offers DESC;
END$$

DROP PROCEDURE IF EXISTS GetCompanyPlacementReport$$
CREATE PROCEDURE GetCompanyPlacementReport()
BEGIN
    SELECT 
        c.Company_Name,
        c.Industry,
        c.Location,
        COUNT(DISTINCT jp.Position_ID) AS Total_Positions,
        COUNT(DISTINCT CASE 
            WHEN jp.Is_Active = TRUE 
            THEN jp.Position_ID 
        END) AS Active_Positions,
        COUNT(DISTINCT a.Application_ID) AS Total_Applications,
        COUNT(DISTINCT CASE 
            WHEN o.Offer_Status = 'Accepted' 
            THEN o.Offer_ID 
        END) AS Offers_Accepted,
        COUNT(DISTINCT CASE 
            WHEN o.Offer_Status = 'Pending' 
            THEN o.Offer_ID 
        END) AS Offers_Pending,
        ROUND(AVG(jp.Package), 2) AS Avg_Package_Offered,
        MAX(jp.Package) AS Highest_Package
    FROM Company c
    LEFT JOIN Job_Position jp ON c.Company_ID = jp.Company_ID
    LEFT JOIN Application_Status a ON jp.Position_ID = a.Position_ID
    LEFT JOIN Offer o ON a.Application_ID = o.Application_ID
    GROUP BY c.Company_ID, c.Company_Name, c.Industry, c.Location
    ORDER BY Offers_Accepted DESC, Total_Applications DESC;
END$$

DROP PROCEDURE IF EXISTS ApplyForPosition$$
CREATE PROCEDURE ApplyForPosition(
    IN p_Student_ID INT,
    IN p_Position_ID INT
)
BEGIN
    DECLARE is_eligible BOOLEAN;
    DECLARE already_applied INT;
    DECLARE student_exists INT;
    DECLARE position_exists INT;
    
    -- Validate student exists
    SELECT COUNT(*) INTO student_exists
    FROM Student WHERE Student_ID = p_Student_ID;
    
    IF student_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student ID does not exist';
    END IF;
    
    -- Validate position exists
    SELECT COUNT(*) INTO position_exists
    FROM Job_Position WHERE Position_ID = p_Position_ID;
    
    IF position_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Position ID does not exist';
    END IF;
    
    -- Check if already applied
    SELECT COUNT(*) INTO already_applied
    FROM Application_Status
    WHERE Student_ID = p_Student_ID AND Position_ID = p_Position_ID;
    
    IF already_applied > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Student has already applied for this position';
    END IF;
    
    -- Check eligibility
    SET is_eligible = CheckEligibility(p_Student_ID, p_Position_ID);
    
    IF is_eligible THEN
        INSERT INTO Application_Status (Student_ID, Position_ID, Current_Status)
        VALUES (p_Student_ID, p_Position_ID, 'Applied');
        SELECT 'Application submitted successfully!' AS Message, 
               LAST_INSERT_ID() AS Application_ID;
    ELSE
        INSERT INTO Application_Status (Student_ID, Position_ID, Current_Status)
        VALUES (p_Student_ID, p_Position_ID, 'Not Eligible');
        SELECT 'Application marked as Not Eligible due to CGPA/Backlogs criteria' AS Message,
               LAST_INSERT_ID() AS Application_ID;
    END IF;
END$$

DROP PROCEDURE IF EXISTS ScheduleInterview$$
CREATE PROCEDURE ScheduleInterview(
    IN p_Application_ID INT,
    IN p_Round_Number INT,
    IN p_Date_Time DATETIME,
    IN p_Mode VARCHAR(20)
)
BEGIN
    DECLARE current_status VARCHAR(30);
    DECLARE app_exists INT;
    
    -- Validate application exists
    SELECT COUNT(*) INTO app_exists
    FROM Application_Status WHERE Application_ID = p_Application_ID;
    
    IF app_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application ID does not exist';
    END IF;
    
    SELECT Current_Status INTO current_status
    FROM Application_Status
    WHERE Application_ID = p_Application_ID;
    
    -- Check if status allows interview scheduling
    IF current_status IN ('Rejected', 'Withdrawn', 'Not Eligible') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot schedule interview for applications with current status';
    END IF;
    
    INSERT INTO Interview (Application_ID, Round_Number, Date_Time, Mode, Result)
    VALUES (p_Application_ID, p_Round_Number, p_Date_Time, p_Mode, 'Pending');
    
    UPDATE Application_Status
    SET Current_Status = 'Interview Scheduled'
    WHERE Application_ID = p_Application_ID;
    
    SELECT CONCAT('Interview scheduled for Round ', p_Round_Number) AS Message,
           LAST_INSERT_ID() AS Interview_ID;
END$$

DROP PROCEDURE IF EXISTS GenerateOffer$$
CREATE PROCEDURE GenerateOffer(
    IN p_Application_ID INT
)
BEGIN
    DECLARE v_Company_ID INT;
    DECLARE v_Position_ID INT;
    DECLARE v_Package DECIMAL(10,2);
    DECLARE offer_exists INT;
    DECLARE app_status VARCHAR(30);
    
    -- Check if application exists
    SELECT COUNT(*), Current_Status INTO offer_exists, app_status
    FROM Application_Status
    WHERE Application_ID = p_Application_ID;
    
    IF offer_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application ID does not exist';
    END IF;
    
    -- Check if offer already exists
    SELECT COUNT(*) INTO offer_exists
    FROM Offer WHERE Application_ID = p_Application_ID;
    
    IF offer_exists > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Offer already exists for this application';
    END IF;
    
    -- Get position and company details
    SELECT jp.Company_ID, jp.Position_ID, jp.Package
    INTO v_Company_ID, v_Position_ID, v_Package
    FROM Application_Status a
    JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
    WHERE a.Application_ID = p_Application_ID;
    
    -- Insert offer
    INSERT INTO Offer (Application_ID, Company_ID, Position_ID, Package, Offer_Status)
    VALUES (p_Application_ID, v_Company_ID, v_Position_ID, v_Package, 'Pending');
    
    -- Update application status
    UPDATE Application_Status
    SET Current_Status = 'Offered'
    WHERE Application_ID = p_Application_ID;
    
    SELECT 'Offer generated successfully!' AS Message,
           LAST_INSERT_ID() AS Offer_ID;
END$$

DROP PROCEDURE IF EXISTS GetStudentApplications$$
CREATE PROCEDURE GetStudentApplications(
    IN p_Student_ID INT
)
BEGIN
    SELECT 
        a.Application_ID,
        c.Company_Name,
        jp.Role,
        jp.Package,
        a.Current_Status,
        a.Date_of_Application,
        COUNT(DISTINCT i.Interview_ID) AS Total_Interviews,
        o.Offer_Status
    FROM Application_Status a
    JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
    JOIN Company c ON jp.Company_ID = c.Company_ID
    LEFT JOIN Interview i ON a.Application_ID = i.Application_ID
    LEFT JOIN Offer o ON a.Application_ID = o.Application_ID
    WHERE a.Student_ID = p_Student_ID
    GROUP BY a.Application_ID, c.Company_Name, jp.Role, jp.Package, 
             a.Current_Status, a.Date_of_Application, o.Offer_Status
    ORDER BY a.Date_of_Application DESC;
END$$

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER $$

DROP TRIGGER IF EXISTS after_offer_accepted$$
CREATE TRIGGER after_offer_accepted
AFTER UPDATE ON Offer
FOR EACH ROW
BEGIN
    DECLARE v_Student_ID INT;

    IF NEW.Offer_Status = 'Accepted' AND OLD.Offer_Status != 'Accepted' THEN
        -- Update response date
        UPDATE Offer 
        SET Response_Date = CURRENT_TIMESTAMP
        WHERE Offer_ID = NEW.Offer_ID;
        
        -- Get student ID
        SELECT Student_ID INTO v_Student_ID
        FROM Application_Status
        WHERE Application_ID = NEW.Application_ID;

        -- Update accepted application
        UPDATE Application_Status
        SET Current_Status = 'Accepted'
        WHERE Application_ID = NEW.Application_ID;

        -- Withdraw other applications
        UPDATE Application_Status
        SET Current_Status = 'Withdrawn'
        WHERE Student_ID = v_Student_ID
          AND Application_ID != NEW.Application_ID
          AND Current_Status NOT IN ('Accepted', 'Rejected', 'Withdrawn');
        
        -- Add comment
        INSERT INTO Comment (Application_ID, Comment_Text)
        VALUES (NEW.Application_ID, 'Offer accepted by student');
    END IF;
END$$

DROP TRIGGER IF EXISTS validate_interview_result$$
CREATE TRIGGER validate_interview_result
BEFORE UPDATE ON Interview
FOR EACH ROW
BEGIN
    -- Auto-update application status based on final round result
    IF NEW.Result = 'Failed' AND OLD.Result != 'Failed' THEN
        UPDATE Application_Status
        SET Current_Status = 'Rejected'
        WHERE Application_ID = NEW.Application_ID;
    END IF;
END$$

DELIMITER ;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

CREATE OR REPLACE VIEW vw_active_applications AS
SELECT 
    s.Student_ID,
    s.Name AS Student_Name,
    s.Branch,
    c.Company_Name,
    jp.Role,
    a.Current_Status,
    a.Date_of_Application,
    jp.Package
FROM Application_Status a
JOIN Student s ON a.Student_ID = s.Student_ID
JOIN Job_Position jp ON a.Position_ID = jp.Position_ID
JOIN Company c ON jp.Company_ID = c.Company_ID
WHERE a.Current_Status NOT IN ('Rejected', 'Withdrawn');

CREATE OR REPLACE VIEW vw_placement_summary AS
SELECT 
    COUNT(DISTINCT s.Student_ID) AS Total_Students,
    COUNT(DISTINCT CASE 
        WHEN a.Current_Status = 'Accepted' 
        THEN s.Student_ID 
    END) AS Placed_Students,
    ROUND(COUNT(DISTINCT CASE 
        WHEN a.Current_Status = 'Accepted' 
        THEN s.Student_ID 
    END) * 100.0 / COUNT(DISTINCT s.Student_ID), 2) AS Placement_Percentage,
    ROUND(AVG(CASE 
        WHEN o.Offer_Status = 'Accepted' 
        THEN o.Package 
    END), 2) AS Avg_Package,
    MAX(CASE 
        WHEN o.Offer_Status = 'Accepted' 
        THEN o.Package 
    END) AS Highest_Package
FROM Student s
LEFT JOIN Application_Status a ON s.Student_ID = a.Student_ID
LEFT JOIN Offer o ON a.Application_ID = o.Application_ID;

-- =====================================================
-- TESTING & VALIDATION
-- =====================================================

SELECT '✓ Database setup complete and ready to use!' AS Status;

-- Test eligibility function
SELECT CheckEligibility(6, 1) AS Is_Eligible;

-- Apply for a position
CALL ApplyForPosition(6, 1);

-- Get placement statistics
CALL GetPlacementStatsByBranch();

-- Get company report
CALL GetCompanyPlacementReport();

-- View active applications
SELECT * FROM vw_active_applications LIMIT 10;

-- View overall placement summary
SELECT * FROM vw_placement_summary;

SELECT * FROM Student; 
SELECT * FROM Academic_Record; 

CALL GenerateOffer(3);

SELECT CheckEligibility(1,1) AS EligibilityStatus;

CALL GetPlacementStatsByBranch(); 
CALL GetCompanyPlacementReport(); 

CALL ScheduleInterview(1, 1, '2025-10-20 10:00:00', 'Online');

UPDATE Offer SET Offer_Status = 'Accepted' WHERE Offer_ID=1; 

SELECT * FROM Application_Status WHERE Student_ID = (
SELECT Student_ID FROM Application_Status WHERE Application_ID = 1
);



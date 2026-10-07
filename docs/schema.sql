-- ==========================================================
-- SmartSync: College Timetable Management System
-- Database Schema (MySQL 8.0+)
-- ==========================================================

DROP DATABASE IF EXISTS smartsync_db;
CREATE DATABASE smartsync_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartsync_db;

-- 1. Users and Roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- 'ROLE_ADMIN', 'ROLE_TEACHER', 'ROLE_STUDENT'
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- BCrypt hashed passwords
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 2. Academic Entities
CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,     -- e.g., 'BCA', 'BTECH_CSE', 'BBA'
    name VARCHAR(150) NOT NULL,          -- e.g., 'Bachelor of Computer Applications'
    department VARCHAR(100) NOT NULL,
    duration_years INT NOT NULL DEFAULT 3,
    total_semesters INT NOT NULL DEFAULT 6,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE sections (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    semester INT NOT NULL,               -- e.g., 3
    name VARCHAR(20) NOT NULL,           -- e.g., 'A', 'B', 'Sec-1'
    academic_year VARCHAR(20) NOT NULL,  -- e.g., '2026-2027'
    student_count INT NOT NULL DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_section UNIQUE (course_id, semester, name, academic_year),
    CONSTRAINT fk_sections_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    code VARCHAR(30) NOT NULL,           -- e.g., 'BCA301'
    name VARCHAR(150) NOT NULL,          -- e.g., 'Data Structures & Algorithms'
    semester INT NOT NULL,
    credits INT NOT NULL DEFAULT 4,
    weekly_lecture_count INT NOT NULL DEFAULT 3, -- classes needed per week
    weekly_lab_count INT NOT NULL DEFAULT 1,     -- lab sessions needed per week
    requires_lab BOOLEAN DEFAULT FALSE,
    preferred_room_type ENUM('LECTURE_HALL', 'COMPUTER_LAB', 'ELECTRONICS_LAB', 'SEMINAR_HALL') DEFAULT 'LECTURE_HALL',
    is_elective BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_subject_code_course UNIQUE (course_id, code),
    CONSTRAINT fk_subjects_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Faculty & Infrastructure Resources
CREATE TABLE teachers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE,               -- Optional linkage to user login
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,   -- e.g., 'Associate Professor'
    max_daily_lectures INT NOT NULL DEFAULT 4,
    max_weekly_lectures INT NOT NULL DEFAULT 18,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE teacher_subject_qualifications (
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    is_primary_faculty BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (teacher_id, subject_id),
    CONSTRAINT fk_tsq_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_tsq_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'LH-201', 'LAB-3'
    building VARCHAR(100) NOT NULL,          -- e.g., 'Academic Block B'
    floor_level INT NOT NULL DEFAULT 1,
    room_type ENUM('LECTURE_HALL', 'COMPUTER_LAB', 'ELECTRONICS_LAB', 'SEMINAR_HALL') NOT NULL,
    capacity INT NOT NULL DEFAULT 60,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Time Slots & Availability Constraints
CREATE TABLE time_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL,
    slot_order INT NOT NULL,             -- 1, 2, 3, 4...
    start_time TIME NOT NULL,            -- e.g., '09:00:00'
    end_time TIME NOT NULL,              -- e.g., '09:55:00'
    is_break BOOLEAN DEFAULT FALSE,      -- e.g., Lunch break / Tea break
    break_label VARCHAR(50),             -- e.g., 'Lunch Recess'
    academic_year VARCHAR(20) NOT NULL,
    CONSTRAINT uq_day_slot UNIQUE (day_of_week, slot_order, academic_year)
) ENGINE=InnoDB;

CREATE TABLE teacher_unavailability (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    reason VARCHAR(255),
    CONSTRAINT uq_teacher_slot UNIQUE (teacher_id, time_slot_id),
    CONSTRAINT fk_tavail_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_tavail_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Timetable Generation, Versioning & Scheduling
CREATE TABLE timetables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    academic_year VARCHAR(20) NOT NULL,
    semester_type ENUM('ODD', 'EVEN') NOT NULL,
    status ENUM('DRAFT', 'GENERATED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
    current_version INT NOT NULL DEFAULT 1,
    generated_by BIGINT,
    generated_at TIMESTAMP NULL,
    published_by BIGINT,
    published_at TIMESTAMP NULL,
    optimization_score DECIMAL(5, 2) DEFAULT NULL, -- Soft constraint evaluation score (0-100)
    hard_conflict_count INT DEFAULT 0,
    soft_penalty_score INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_timetable_gen_user FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_timetable_pub_user FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE timetable_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timetable_id BIGINT NOT NULL,
    section_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    time_slot_id BIGINT NOT NULL,
    entry_type ENUM('LECTURE', 'LAB', 'TUTORIAL') DEFAULT 'LECTURE',
    status ENUM('NORMAL', 'CHANGED', 'CONFLICT', 'PENDING') DEFAULT 'NORMAL',
    version_number INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_entry_timetable FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
    CONSTRAINT fk_entry_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    CONSTRAINT fk_entry_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_entry_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_entry_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_entry_slot FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Change Management & Audit Log
CREATE TABLE timetable_change_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timetable_id BIGINT NOT NULL,
    timetable_entry_id BIGINT,
    change_type ENUM('MODIFICATION', 'CANCELLATION', 'ROOM_SWAP', 'FACULTY_SWAP', 'NEW_ENTRY') NOT NULL,
    old_value JSON,                     -- Snapshot of old state: {room, teacher, slot}
    new_value JSON,                     -- Snapshot of new state: {room, teacher, slot}
    reason VARCHAR(255),
    changed_by BIGINT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_notified BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_log_timetable FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE,
    CONSTRAINT fk_log_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE timetable_conflicts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timetable_id BIGINT NOT NULL,
    conflict_type ENUM('TEACHER_DOUBLE_BOOKING', 'ROOM_DOUBLE_BOOKING', 'SECTION_DOUBLE_BOOKING', 'CAPACITY_EXCEEDED', 'LAB_MISMATCH', 'UNAVAILABLE_TEACHER') NOT NULL,
    severity ENUM('HARD', 'SOFT') NOT NULL DEFAULT 'HARD',
    description TEXT NOT NULL,
    affected_entry_ids JSON,            -- IDs of colliding timetable_entries
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conflict_timetable FOREIGN KEY (timetable_id) REFERENCES timetables(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexes for high-frequency queries
CREATE INDEX idx_entry_search ON timetable_entries(timetable_id, section_id, time_slot_id);
CREATE INDEX idx_teacher_schedule ON timetable_entries(timetable_id, teacher_id, time_slot_id);
CREATE INDEX idx_room_schedule ON timetable_entries(timetable_id, room_id, time_slot_id);

-- ==========================================================
-- CLEARLY MARKED SAMPLE DATA (For Development & Demonstration)
-- ==========================================================

-- Roles
INSERT INTO roles (name, description) VALUES 
('ROLE_ADMIN', 'Academic Administrator with full timetable control'),
('ROLE_TEACHER', 'Faculty Member with personal schedule view'),
('ROLE_STUDENT', 'Enrolled Student with section schedule view');

-- Sample Admin User
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id) VALUES
('admin', 'admin@college.edu', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58bW7V02.5jUu25eH45J3hK6Nq3C', 'Academic', 'Dean', 1);

-- Sample Courses (BCA + B.Tech CSE + BBA)
INSERT INTO courses (code, name, department, duration_years, total_semesters) VALUES
('BCA', 'Bachelor of Computer Applications', 'Computer Science', 3, 6),
('BTECH_CSE', 'B.Tech in Computer Science & Engineering', 'Engineering', 4, 8),
('BBA', 'Bachelor of Business Administration', 'Management', 3, 6);

-- Sample Sections
INSERT INTO sections (course_id, semester, name, academic_year, student_count) VALUES
(1, 3, 'Section A', '2026-2027', 45),
(1, 3, 'Section B', '2026-2027', 42),
(2, 3, 'CSE-A', '2026-2027', 55);

-- Sample Subjects
INSERT INTO subjects (course_id, code, name, semester, credits, weekly_lecture_count, weekly_lab_count, requires_lab, preferred_room_type) VALUES
(1, 'BCA301', 'Data Structures & Algorithms', 3, 4, 3, 1, TRUE, 'COMPUTER_LAB'),
(1, 'BCA302', 'Database Management Systems', 3, 4, 3, 1, TRUE, 'COMPUTER_LAB'),
(1, 'BCA303', 'Object Oriented Programming (Java)', 3, 4, 3, 1, TRUE, 'COMPUTER_LAB'),
(1, 'BCA304', 'Discrete Mathematics', 3, 3, 3, 0, FALSE, 'LECTURE_HALL'),
(1, 'BCA305', 'Computer Architecture', 3, 3, 3, 0, FALSE, 'LECTURE_HALL');

-- Sample Teachers
INSERT INTO teachers (employee_id, full_name, email, department, designation, max_daily_lectures) VALUES
('EMP-CS-101', 'Dr. Arvind Sharma', 'a.sharma@college.edu', 'Computer Science', 'Professor', 3),
('EMP-CS-102', 'Prof. Priya Nair', 'p.nair@college.edu', 'Computer Science', 'Associate Professor', 4),
('EMP-CS-103', 'Dr. Rajesh Verma', 'r.verma@college.edu', 'Computer Science', 'Assistant Professor', 4),
('EMP-MATH-201', 'Prof. Sunita Rao', 's.rao@college.edu', 'Mathematics', 'Associate Professor', 3);

-- Sample Rooms & Labs
INSERT INTO rooms (room_number, building, floor_level, room_type, capacity) VALUES
('LH-101', 'Aryabhatta Block', 1, 'LECTURE_HALL', 60),
('LH-102', 'Aryabhatta Block', 1, 'LECTURE_HALL', 60),
('LAB-201', 'Turing Lab Complex', 2, 'COMPUTER_LAB', 50),
('LAB-202', 'Turing Lab Complex', 2, 'COMPUTER_LAB', 50),
('LH-203', 'Aryabhatta Block', 2, 'LECTURE_HALL', 70);

-- Sample Time Slots (Monday to Friday, 5 lecture slots + 1 lunch recess)
INSERT INTO time_slots (day_of_week, slot_order, start_time, end_time, is_break, break_label, academic_year) VALUES
('MONDAY', 1, '09:00:00', '09:55:00', FALSE, NULL, '2026-2027'),
('MONDAY', 2, '10:00:00', '10:55:00', FALSE, NULL, '2026-2027'),
('MONDAY', 3, '11:00:00', '11:55:00', FALSE, NULL, '2026-2027'),
('MONDAY', 4, '12:00:00', '12:45:00', TRUE, 'Lunch Break', '2026-2027'),
('MONDAY', 5, '13:00:00', '13:55:00', FALSE, NULL, '2026-2027'),
('MONDAY', 6, '14:00:00', '14:55:00', FALSE, NULL, '2026-2027');

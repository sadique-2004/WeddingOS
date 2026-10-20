-- ==============================================================================
-- WeddingOS — Production Relational Database Schema
-- Database: MySQL 8.0+ | Engine: InnoDB | Encoding: utf8mb4
-- Documentation Reference: docs/DBDD.md & docs/PRD.md
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS weddingos_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE weddingos_db;

-- ------------------------------------------------------------------------------
-- 1. APP USERS (Mapped to Clerk External Identity)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    clerk_user_id VARCHAR(191) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX idx_app_users_email (email)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. WEDDINGS (Central Workspace Boundary)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS weddings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id BIGINT NOT NULL,
    bride_name VARCHAR(120) NOT NULL,
    groom_name VARCHAR(120) NOT NULL,
    wedding_date DATE NOT NULL,
    city VARCHAR(120) NOT NULL,
    venue_name VARCHAR(255) NULL,
    total_budget_target DECIMAL(12,2) NOT NULL DEFAULT 2500000.00,
    expected_guest_capacity INT NOT NULL DEFAULT 350,
    currency_code CHAR(3) NOT NULL DEFAULT 'INR',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_weddings_owner FOREIGN KEY (owner_user_id) REFERENCES app_users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. WEDDING SLUGS (Unique Public URL Handles, e.g. /w/ananya-kabir)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wedding_slugs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_slugs_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. WEDDING MEMBERSHIPS (Admin vs Organizer Roles & 8 Permissions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wedding_memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('ADMIN', 'ORGANIZER') NOT NULL DEFAULT 'ORGANIZER',
    title VARCHAR(120) NULL,
    
    -- Granular 8-module permission matrix (PRD § 7.5)
    can_manage_events BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_tasks BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_guests BOOLEAN NOT NULL DEFAULT TRUE,
    can_check_in_guests BOOLEAN NOT NULL DEFAULT TRUE,
    can_manage_expenses BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_vendors BOOLEAN NOT NULL DEFAULT FALSE,
    can_manage_website BOOLEAN NOT NULL DEFAULT FALSE,
    can_moderate_gallery BOOLEAN NOT NULL DEFAULT TRUE,
    
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE KEY uq_membership_user (wedding_id, user_id),
    CONSTRAINT fk_memberships_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. WEDDING EVENTS (Multi-Day Ceremony Run of Show)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wedding_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    sequence_order INT NOT NULL DEFAULT 1,
    event_type VARCHAR(60) NOT NULL, -- haldi, mehendi, sangeet, pheras, reception
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    event_date DATE NOT NULL,
    day_label VARCHAR(60) NOT NULL, -- e.g. "Day 1", "Day 2"
    start_time VARCHAR(20) NOT NULL, -- e.g. "10:00 AM"
    end_time VARCHAR(20) NOT NULL,   -- e.g. "01:00 PM"
    venue_name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    map_url VARCHAR(500) NULL,
    dress_code VARCHAR(255) NULL,
    cover_image_url VARCHAR(500) NULL,
    attendee_estimate INT NOT NULL DEFAULT 250,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_events_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_events_date (wedding_id, event_date, sequence_order)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. PREPARATION TASKS (Checklist & Kanban System)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preparation_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    assigned_user_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(60) NOT NULL, -- Attire, Decor, Logistics, Rituals, Catering, Legal
    priority ENUM('URGENT', 'HIGH', 'NORMAL', 'LOW') NOT NULL DEFAULT 'NORMAL',
    status ENUM('TODO', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'TODO',
    due_date DATE NULL,
    completed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_tasks_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_user FOREIGN KEY (assigned_user_id) REFERENCES app_users(id) ON DELETE SET NULL,
    INDEX idx_tasks_status (wedding_id, status, priority)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. FAMILY INVITATIONS (Joint-Family Unit Invitations & RSVPs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS family_invitations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    display_name VARCHAR(150) NOT NULL, -- e.g. "The Singhania Family"
    primary_contact_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    email VARCHAR(255) NULL,
    circle VARCHAR(60) NOT NULL DEFAULT 'Nanihal (Maternal)',
    max_attendees INT NOT NULL DEFAULT 4,
    actual_attendees INT NOT NULL DEFAULT 0,
    rsvp_status ENUM('PENDING', 'ATTENDING', 'NOT_ATTENDING') NOT NULL DEFAULT 'PENDING',
    dietary_notes TEXT NULL,
    invitation_token VARCHAR(120) NOT NULL UNIQUE,
    organizer_notes TEXT NULL,
    checked_in_at DATETIME(3) NULL,
    checked_in_by VARCHAR(120) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_invitations_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    INDEX idx_invitations_token (invitation_token),
    INDEX idx_invitations_phone (wedding_id, phone_number)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 8. CHECK-IN LOGS (Audit Trail & Duplicate Scan Detection)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS check_in_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    invitation_id BIGINT NOT NULL,
    family_name VARCHAR(150) NOT NULL,
    primary_contact VARCHAR(120) NOT NULL,
    attendee_count INT NOT NULL,
    max_attendees INT NOT NULL,
    circle VARCHAR(60) NOT NULL,
    checked_in_by VARCHAR(120) NOT NULL,
    is_duplicate_attempt BOOLEAN NOT NULL DEFAULT FALSE,
    scanned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_logs_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    CONSTRAINT fk_logs_invitation FOREIGN KEY (invitation_id) REFERENCES family_invitations(id) ON DELETE CASCADE,
    INDEX idx_logs_time (wedding_id, scanned_at DESC)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 9. VENDOR CONTACTS (Directory & Contracts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(120) NOT NULL,
    category VARCHAR(60) NOT NULL, -- Photography, Catering, Decor, Pandit Ji, DJ, Attire
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NULL,
    total_contract_value DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    advance_paid DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_stage ENUM('PENDING', 'PARTIALLY_PAID', 'SETTLED') NOT NULL DEFAULT 'PENDING',
    notes TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_vendors_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 10. EXPENSES (Expenditure Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    vendor_id BIGINT NULL,
    event_id BIGINT NULL,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(60) NOT NULL, -- Venue & Hospitality, Catering, Decor, Photography, Jewelry, Logistics
    amount DECIMAL(12,2) NOT NULL,
    currency_code CHAR(3) NOT NULL DEFAULT 'INR',
    expense_date DATE NOT NULL,
    payment_status ENUM('PAID', 'PENDING', 'ADVANCE_PAID') NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50) NULL, -- UPI, NEFT, Net Banking, Cash, Card
    notes TEXT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_expenses_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_contacts(id) ON DELETE SET NULL,
    CONSTRAINT fk_expenses_event FOREIGN KEY (event_id) REFERENCES wedding_events(id) ON DELETE SET NULL,
    INDEX idx_expenses_category (wedding_id, category)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 11. WEDDING WEBSITES (No-Code Public Website Config)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wedding_websites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL UNIQUE,
    theme_key ENUM('ROYAL_UDAIPUR', 'EMERALD_PALACE', 'MARIGOLD_FESTIVE') NOT NULL DEFAULT 'ROYAL_UDAIPUR',
    welcome_headline VARCHAR(255) NOT NULL DEFAULT 'Celebrating Our Sacred Union',
    welcome_message TEXT NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    show_schedule BOOLEAN NOT NULL DEFAULT TRUE,
    show_dress_code BOOLEAN NOT NULL DEFAULT TRUE,
    show_venues BOOLEAN NOT NULL DEFAULT TRUE,
    show_livestream BOOLEAN NOT NULL DEFAULT FALSE,
    livestream_url VARCHAR(500) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_websites_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 12. GALLERY PHOTOS (Moderation Queue & Event Albums)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_photos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wedding_id BIGINT NOT NULL,
    event_id BIGINT NULL,
    photo_url VARCHAR(500) NOT NULL,
    caption VARCHAR(255) NULL,
    uploader_name VARCHAR(120) NOT NULL DEFAULT 'Wedding Guest',
    moderation_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    is_highlight BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    reviewed_at DATETIME(3) NULL,
    CONSTRAINT fk_gallery_wedding FOREIGN KEY (wedding_id) REFERENCES weddings(id) ON DELETE CASCADE,
    CONSTRAINT fk_gallery_event FOREIGN KEY (event_id) REFERENCES wedding_events(id) ON DELETE SET NULL,
    INDEX idx_gallery_status (wedding_id, moderation_status)
) ENGINE=InnoDB;

-- ==============================================================================
-- SEED DATA (Realistic Demo Indian Wedding: Ananya & Kabir)
-- ==============================================================================

-- Seed User
INSERT INTO app_users (id, clerk_user_id, email, full_name)
VALUES (1, 'user_clerk_demo_aisha', 'aisha.sharma@weddingos.app', 'Aisha Sharma')
ON DUPLICATE KEY UPDATE email=email;

-- Seed Wedding
INSERT INTO weddings (id, owner_user_id, bride_name, groom_name, wedding_date, city, venue_name, total_budget_target, expected_guest_capacity)
VALUES (1, 1, 'Ananya Sharma', 'Kabir Singhania', '2026-11-28', 'Udaipur, Rajasthan', 'Taj Lake Palace, Udaipur', 2500000.00, 350)
ON DUPLICATE KEY UPDATE bride_name=bride_name;

-- Seed Slug
INSERT INTO wedding_slugs (wedding_id, slug, is_active)
VALUES (1, 'ananya-kabir', TRUE)
ON DUPLICATE KEY UPDATE slug=slug;

-- Seed Admin Membership
INSERT INTO wedding_memberships (wedding_id, user_id, role, title, can_manage_events, can_manage_tasks, can_manage_guests, can_check_in_guests, can_manage_expenses, can_manage_vendors, can_manage_website, can_moderate_gallery)
VALUES (1, 1, 'ADMIN', 'Bride & Workspace Co-Owner', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE role=role;

-- Seed 5 Ceremonies
INSERT INTO wedding_events (wedding_id, sequence_order, event_type, name, description, event_date, day_label, start_time, end_time, venue_name, address, dress_code, attendee_estimate)
VALUES
(1, 1, 'haldi', 'Haldi Ceremony & Auspicious Turmeric Ritual', 'Traditional auspicious yellow turmeric ritual followed by floral blessings.', '2026-11-26', 'Day 1', '10:00 AM', '01:00 PM', 'Poolside Courtyard', 'Taj Lake Palace, Lake Pichola, Udaipur', 'Turmeric Yellow & Vibrant Whites', 220),
(1, 2, 'mehendi', 'Royal Mehendi & High Tea Soiree', 'Intricate Rajasthani henna adornments with folk musicians and royal high tea.', '2026-11-26', 'Day 1', '03:30 PM', '07:00 PM', 'Royal Garden Terraces', 'Taj Lake Palace, Lake Pichola, Udaipur', 'Emerald Greens & Floral Pastels', 250),
(1, 3, 'sangeet', 'Royal Sangeet & Musical Night', 'A grand evening of choreographed family dance showcases and musical orchestra.', '2026-11-26', 'Day 1', '07:30 PM', '11:45 PM', 'The Grand Mewar Ballroom', 'Taj Lake Palace, Lake Pichola, Udaipur', 'Indo-Western Glitz & Glamour', 350),
(1, 4, 'pheras', 'Traditional Vedic Pheras & Sunset Vivah', 'Seven sacred rounds around the holy fire as the sunset reflects upon Lake Pichola.', '2026-11-27', 'Day 2', '04:30 PM', '08:30 PM', 'Palace Mandap by the Lake', 'Taj Lake Palace, Lake Pichola, Udaipur', 'Royal Traditional Sherwanis & Regal Silk Sarees', 300),
(1, 5, 'reception', 'Grand Royal Reception & Gala Banquet', 'Formal reception with international culinary banquet to welcome the newlyweds.', '2026-11-28', 'Day 3', '07:30 PM', '11:30 PM', 'Lakeview Terrace & Ballrooms', 'Taj Lake Palace, Lake Pichola, Udaipur', 'Black Tie / Evening Regalia', 400);

-- Seed Family Invitations
INSERT INTO family_invitations (wedding_id, display_name, primary_contact_name, phone_number, email, circle, max_attendees, actual_attendees, rsvp_status, dietary_notes, invitation_token)
VALUES
(1, 'The Singhania Family', 'Rajesh Singhania', '+91 98201 44521', 'rajesh@mewartextiles.com', 'Dadihal (Paternal)', 5, 5, 'ATTENDING', 'Strict Jain Catering (No root vegetables)', 'wos-singhania-8821'),
(1, 'Justice & Mrs. Verma', 'Justice Alok Verma', '+91 98110 99823', 'alok.verma@courts.gov.in', 'VIP Patrons', 2, 2, 'ATTENDING', 'Diabetic dessert alternatives requested', 'wos-verma-4192'),
(1, 'The Roy Chowdhury Clan', 'Subir Roy Chowdhury', '+91 98300 23145', 'subir@kolkatatea.in', 'Nanihal (Maternal)', 6, 4, 'ATTENDING', 'Royal Indian Vegetarian & Non-Veg', 'wos-chowdhury-7301'),
(1, 'Dr. Siddharth & Dr. Neha Kapoor', 'Dr. Siddharth Kapoor', '+44 7911 123456', 'sid.kapoor@nhs.uk', 'International', 3, 3, 'PENDING', 'Severe nut allergy for child', 'wos-kapoor-9920'),
(1, 'Vikramaditya Oberoi & Partners', 'Vikramaditya Oberoi', '+91 98210 65432', 'v.oberoi@palacecap.com', 'Friends & Colleagues', 2, 2, 'PENDING', 'None', 'wos-oberoi-5512');

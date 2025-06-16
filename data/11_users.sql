-- Users Sample Data
-- Authentication users for the IPL database system
-- Sample users with different roles
-- Note: In production, passwords should be properly hashed using bcrypt
-- These are sample hashed passwords for: admin123, scorer123, viewer123
INSERT INTO
   Users (email, password_hash, name, role, is_active)
VALUES
   -- Admin users
   (
      'admin@ipl.com',
      '$2b$10$rOiQ5V8/5gJZo5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5oe',
      'IPL Admin',
      'admin',
      TRUE
   ),
   (
      'superadmin@bcci.in',
      '$2b$10$rOiQ5V8/5gJZo5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5oe',
      'BCCI Administrator',
      'admin',
      TRUE
   ),
   -- Scorer users
   (
      'scorer1@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'Match Scorer 1',
      'scorer',
      TRUE
   ),
   (
      'scorer2@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'Match Scorer 2',
      'scorer',
      TRUE
   ),
   (
      'scorer.mumbai@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'Mumbai Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.chennai@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'Chennai Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.bangalore@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'Bangalore Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.kolkata@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'Kolkata Scorer',
      'scorer',
      TRUE
   ),
   -- Viewer users
   (
      'viewer@ipl.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'IPL Viewer',
      'viewer',
      TRUE
   ),
   (
      'fan1@gmail.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'Cricket Fan 1',
      'viewer',
      TRUE
   ),
   (
      'fan2@gmail.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'Cricket Fan 2',
      'viewer',
      TRUE
   ),
   (
      'journalist@cricinfo.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'Sports Journalist',
      'viewer',
      TRUE
   ),
   (
      'analyst@ipl.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'IPL Analyst',
      'viewer',
      TRUE
   ),
   -- Team management users
   (
      'manager.mi@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'MI Team Manager',
      'scorer',
      TRUE
   ),
   (
      'manager.csk@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'CSK Team Manager',
      'scorer',
      TRUE
   ),
   (
      'manager.rcb@ipl.com',
      '$2b$10$scorer123hash456789012345678901234567890123456789012345',
      'RCB Team Manager',
      'scorer',
      TRUE
   ),
   -- Inactive user (for testing)
   (
      'inactive@ipl.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'Inactive User',
      'viewer',
      FALSE
   ),
   -- Media users
   (
      'media@starsports.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'Star Sports',
      'viewer',
      TRUE
   ),
   (
      'media@hotstar.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'Disney+ Hotstar',
      'viewer',
      TRUE
   ),
   (
      'commentator@ipl.com',
      '$2b$10$viewer123hash456789012345678901234567890123456789012345',
      'IPL Commentator',
      'viewer',
      TRUE
   );

-- Test users for development (should be removed in production)
INSERT INTO
   Users (email, password_hash, name, role, is_active)
VALUES
   (
      'test.admin@test.com',
      '$2b$10$test123hash4567890123456789012345678901234567890123456',
      'Test Admin',
      'admin',
      TRUE
   ),
   (
      'test.scorer@test.com',
      '$2b$10$test123hash4567890123456789012345678901234567890123456',
      'Test Scorer',
      'scorer',
      TRUE
   ),
   (
      'test.viewer@test.com',
      '$2b$10$test123hash4567890123456789012345678901234567890123456',
      'Test Viewer',
      'viewer',
      TRUE
   );
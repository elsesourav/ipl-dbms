-- Insert Users Data
-- User accounts for different roles in the IPL management system
INSERT INTO
   Users (email, password_hash, name, role, is_active)
VALUES
   -- Admin Users
   (
      'admin@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'IPL Administrator',
      'admin',
      TRUE
   ),
   (
      'system.admin@bcci.in',
      '$2b$10$examplehash1234567890abcdef',
      'BCCI System Admin',
      'admin',
      TRUE
   ),
   -- Scorer Users
   (
      'scorer.mumbai@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'Mumbai Indians Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.chennai@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'Chennai Super Kings Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.kolkata@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'Kolkata Knight Riders Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.bangalore@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'Royal Challengers Bangalore Scorer',
      'scorer',
      TRUE
   ),
   (
      'scorer.official@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'Official IPL Scorer',
      'scorer',
      TRUE
   ),
   -- Viewer Users (Public/Fan accounts)
   (
      'fan.cricket@gmail.com',
      '$2b$10$examplehash1234567890abcdef',
      'Cricket Fan User',
      'viewer',
      TRUE
   ),
   (
      'stats.analyst@cricket.com',
      '$2b$10$examplehash1234567890abcdef',
      'Cricket Statistics Analyst',
      'viewer',
      TRUE
   ),
   (
      'media.reporter@sportsnews.com',
      '$2b$10$examplehash1234567890abcdef',
      'Sports Media Reporter',
      'viewer',
      TRUE
   ),
   (
      'guest.user@ipl.com',
      '$2b$10$examplehash1234567890abcdef',
      'Guest User',
      'viewer',
      TRUE
   );
-- Master Data Loader Script
-- This script loads all sample data in the correct order to maintain referential integrity


-- Disable foreign key checks temporarily for bulk loading
SET FOREIGN_KEY_CHECKS = 0;

-- Load data in order of dependencies
SOURCE 01_teams.sql;
SOURCE 02_stadiums.sql;
SOURCE 03_series.sql;
SOURCE 04_umpires.sql;
SOURCE 05_players.sql;
SOURCE 06_matches.sql;
SOURCE 07_batting_scorecards.sql;
SOURCE 08_bowling_scorecards.sql;
SOURCE 09_team_stats.sql;
SOURCE 10_player_stats.sql;
SOURCE 11_users.sql;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Update team captains after players are loaded
UPDATE Teams SET captain_id = 1 WHERE team_id = 1;   -- Rohit Sharma for MI
UPDATE Teams SET captain_id = 9 WHERE team_id = 2;   -- MS Dhoni for CSK
UPDATE Teams SET captain_id = 15 WHERE team_id = 3;  -- Virat Kohli for RCB
UPDATE Teams SET captain_id = 20 WHERE team_id = 4;  -- Shreyas Iyer for KKR
UPDATE Teams SET captain_id = 26 WHERE team_id = 5;  -- Rishabh Pant for DC
UPDATE Teams SET captain_id = 31 WHERE team_id = 6;  -- KL Rahul for PBKS
UPDATE Teams SET captain_id = 36 WHERE team_id = 7;  -- Sanju Samson for RR
UPDATE Teams SET captain_id = 41 WHERE team_id = 8;  -- Kane Williamson for SRH
UPDATE Teams SET captain_id = 46 WHERE team_id = 9;  -- Hardik Pandya for GT
UPDATE Teams SET captain_id = 51 WHERE team_id = 10; -- KL Rahul for LSG

-- Display summary of loaded data
SELECT 'Data Loading Summary' AS message;
SELECT 'Teams' AS table_name, COUNT(*) AS records_loaded FROM Teams;
SELECT 'Stadiums' AS table_name, COUNT(*) AS records_loaded FROM Stadiums;
SELECT 'Series' AS table_name, COUNT(*) AS records_loaded FROM Series;
SELECT 'Umpires' AS table_name, COUNT(*) AS records_loaded FROM Umpires;
SELECT 'Players' AS table_name, COUNT(*) AS records_loaded FROM Players;
SELECT 'Matches' AS table_name, COUNT(*) AS records_loaded FROM Matches;
SELECT 'BattingScorecard' AS table_name, COUNT(*) AS records_loaded FROM BattingScorecard;
SELECT 'BowlingScorecard' AS table_name, COUNT(*) AS records_loaded FROM BowlingScorecard;
SELECT 'TeamStats' AS table_name, COUNT(*) AS records_loaded FROM TeamStats;
SELECT 'PlayerStats' AS table_name, COUNT(*) AS records_loaded FROM PlayerStats;
SELECT 'Users' AS table_name, COUNT(*) AS records_loaded FROM Users;

SELECT 'Data loading completed successfully!' AS status;

-- Sample TeamStats data for IPL 2024 season
-- This will populate the TeamStats table with realistic IPL data

-- First, let's ensure we have a series for 2024
INSERT IGNORE INTO Series (series_name, season_year, start_date, end_date, num_teams, total_matches, is_completed)
VALUES ('IPL 2024', 2024, '2024-03-22', '2024-05-26', 10, 74, FALSE);

-- Get the series_id for IPL 2024
SET @series_id = (SELECT series_id FROM Series WHERE season_year = 2024 LIMIT 1);

-- Insert team statistics for IPL 2024
-- These are sample/realistic data based on typical IPL performance
INSERT INTO TeamStats (team_id, series_id, matches_played, matches_won, matches_lost, no_results, points, net_run_rate)
VALUES
-- Mumbai Indians (assuming team_id 1)
(1, @series_id, 14, 9, 5, 0, 18, 0.345),
-- Chennai Super Kings (assuming team_id 2)  
(2, @series_id, 14, 8, 6, 0, 16, 0.528),
-- Royal Challengers Bangalore (assuming team_id 3)
(3, @series_id, 14, 8, 6, 0, 16, -0.135),
-- Kolkata Knight Riders (assuming team_id 4)
(4, @series_id, 14, 7, 7, 0, 14, 0.245),
-- Delhi Capitals (assuming team_id 5)
(5, @series_id, 14, 7, 7, 0, 14, -0.082),
-- Rajasthan Royals (assuming team_id 6)
(6, @series_id, 14, 6, 8, 0, 12, -0.267),
-- Punjab Kings (assuming team_id 7)
(7, @series_id, 14, 6, 8, 0, 12, -0.456),
-- Sunrisers Hyderabad (assuming team_id 8)
(8, @series_id, 14, 5, 9, 0, 10, -0.789),
-- Gujarat Titans (assuming team_id 9)
(9, @series_id, 14, 4, 10, 0, 8, -0.234),
-- Lucknow Super Giants (assuming team_id 10)
(10, @series_id, 14, 4, 10, 0, 8, -0.512)
ON DUPLICATE KEY UPDATE
matches_played = VALUES(matches_played),
matches_won = VALUES(matches_won),
matches_lost = VALUES(matches_lost),
no_results = VALUES(no_results),
points = VALUES(points),
net_run_rate = VALUES(net_run_rate);

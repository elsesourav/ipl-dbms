-- Insert Matches Data
-- Sample matches for 2023 and 2024 IPL seasons

-- IPL 2023 Matches
INSERT INTO Matches (series_id, match_number, match_type, team1_id, team2_id, stadium_id, match_date, match_time, match_status, toss_winner_id, toss_decision, winner_id, win_type, win_margin, man_of_match_id, umpire1_id, umpire2_id, third_umpire_id, weather_conditions, pitch_conditions, temperature_celsius, humidity_percent, is_day_night, is_completed) VALUES

-- Match 1: KKR vs RCB (2023)
(1, 1, 'league', 1, 4, 1, '2023-04-01', '19:30:00', 'completed', 1, 'bowl', 1, 'runs', 81, 2, 1, 2, 3, 'Clear', 'Good batting track', 28, 65, TRUE, TRUE),

-- Match 2: MI vs CSK (2023)
(1, 2, 'league', 2, 3, 2, '2023-04-02', '15:30:00', 'completed', 3, 'bat', 3, 'wickets', 5, 35, 4, 5, 6, 'Partly cloudy', 'Spin-friendly', 32, 70, FALSE, TRUE),

-- Match 3: CSK vs KKR (2023)
(1, 3, 'league', 3, 1, 3, '2023-04-03', '19:30:00', 'completed', 3, 'bat', 1, 'runs', 6, 5, 7, 8, 9, 'Clear', 'Good batting track', 30, 60, TRUE, TRUE),

-- Match 4: RCB vs MI (2023)
(1, 4, 'league', 4, 2, 4, '2023-04-04', '19:30:00', 'completed', 4, 'bowl', 2, 'wickets', 8, 22, 10, 11, 12, 'Humid', 'Balanced pitch', 26, 75, TRUE, TRUE),

-- Match 5: KKR vs MI (2023)
(1, 5, 'league', 1, 2, 1, '2023-04-05', '19:30:00', 'completed', 2, 'bat', 1, 'runs', 18, 1, 13, 14, 15, 'Clear', 'Batting paradise', 29, 55, TRUE, TRUE),

-- Match 6: CSK vs RCB (2023)
(1, 6, 'league', 3, 4, 3, '2023-04-06', '19:30:00', 'completed', 4, 'bowl', 3, 'runs', 8, 32, 1, 2, 3, 'Overcast', 'Good for bowling', 31, 68, TRUE, TRUE),

-- IPL 2024 Matches
-- Match 1: KKR vs CSK (2024)
(2, 1, 'league', 1, 3, 1, '2024-03-22', '19:30:00', 'completed', 1, 'bat', 1, 'runs', 7, 10, 4, 5, 6, 'Clear', 'Batting track', 27, 62, TRUE, TRUE),

-- Match 2: MI vs RCB (2024)
(2, 2, 'league', 2, 4, 2, '2024-03-23', '15:30:00', 'completed', 2, 'bowl', 4, 'wickets', 7, 46, 7, 8, 9, 'Sunny', 'Balanced', 33, 58, FALSE, TRUE),

-- Match 3: RCB vs KKR (2024)
(2, 3, 'league', 4, 1, 4, '2024-03-24', '19:30:00', 'completed', 4, 'bat', 1, 'runs', 1, 11, 10, 11, 12, 'Perfect', 'Flat track', 25, 60, TRUE, TRUE),

-- Match 4: CSK vs MI (2024)
(2, 4, 'league', 3, 2, 3, '2024-03-25', '19:30:00', 'completed', 3, 'bowl', 2, 'runs', 20, 26, 13, 14, 15, 'Humid', 'Two-paced', 30, 72, TRUE, TRUE),

-- Match 5: KKR vs RCB (2024) - Return match
(2, 5, 'league', 1, 4, 1, '2024-03-26', '19:30:00', 'completed', 1, 'bowl', 1, 'runs', 27, 2, 1, 2, 3, 'Clear', 'Good for batting', 28, 65, TRUE, TRUE),

-- Match 6: MI vs CSK (2024) - Return match
(2, 6, 'league', 2, 3, 2, '2024-03-27', '19:30:00', 'completed', 2, 'bat', 3, 'wickets', 6, 35, 4, 5, 6, 'Partly cloudy', 'Helping bowlers', 31, 70, TRUE, TRUE),

-- Playoff Match Examples
-- Qualifier 1 - 2023
(1, 71, 'qualifier1', 3, 1, 3, '2023-05-23', '19:30:00', 'completed', 3, 'bat', 3, 'runs', 15, 35, 7, 8, 9, 'Perfect', 'Good batting', 29, 58, TRUE, TRUE),

-- Final - 2023
(1, 74, 'final', 3, 1, 5, '2023-05-28', '19:30:00', 'completed', 1, 'bowl', 3, 'wickets', 5, 31, 10, 11, 12, 'Ideal', 'Balanced', 27, 60, TRUE, TRUE),

-- Qualifier 1 - 2024
(2, 71, 'qualifier1', 1, 2, 1, '2024-05-21', '19:30:00', 'completed', 1, 'bat', 1, 'runs', 24, 2, 13, 14, 15, 'Clear', 'Batting friendly', 28, 55, TRUE, TRUE),

-- Final - 2024
(2, 74, 'final', 1, 3, 3, '2024-05-26', '19:30:00', 'completed', 3, 'bowl', 1, 'runs', 8, 1, 1, 2, 3, 'Perfect', 'Good for cricket', 26, 62, TRUE, TRUE);

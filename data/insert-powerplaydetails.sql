-- Insert Powerplay Details Data
-- Powerplay performance for matches

INSERT INTO PowerplayDetails (match_id, team_id, innings, mandatory_powerplay_runs, mandatory_powerplay_wickets, batting_powerplay_runs, batting_powerplay_wickets, batting_powerplay_overs, bowling_powerplay_runs, bowling_powerplay_wickets, bowling_powerplay_overs) VALUES
-- Match 1: KKR vs RCB (2023) - KKR Powerplay (First Innings)
(1, 1, 'first', 52, 1, 38, 1, '7-8', 35, 0, '15-16'),

-- Match 1: KKR vs RCB (2023) - RCB Powerplay (Second Innings)
(1, 4, 'second', 45, 2, 32, 1, '8-9', 28, 2, '14-15'),

-- Match 2: MI vs CSK (2023) - CSK Powerplay (First Innings)
(2, 3, 'first', 58, 0, 42, 1, '7-8', 31, 1, '16-17'),

-- Match 2: MI vs CSK (2023) - MI Powerplay (Second Innings)
(2, 2, 'second', 48, 1, 35, 0, '8-9', 25, 2, '15-16'),

-- Match 7: KKR vs CSK (2024) - KKR Powerplay (First Innings)
(7, 1, 'first', 62, 1, 45, 0, '7-8', 38, 1, '15-16'),

-- Match 7: KKR vs CSK (2024) - CSK Powerplay (Second Innings)
(7, 3, 'second', 51, 2, 28, 2, '8-9', 22, 1, '14-15'),

-- Match 3: CSK vs KKR (2023) - CSK Powerplay
(3, 3, 'first', 55, 0, 48, 0, '7-8', 42, 0, '16-17'),

-- Match 3: CSK vs KKR (2023) - KKR Powerplay
(3, 1, 'second', 49, 1, 31, 2, '8-9', 28, 1, '15-16'),

-- Match 4: RCB vs MI (2023) - RCB Powerplay
(4, 4, 'first', 47, 2, 35, 1, '7-8', 32, 0, '15-16'),

-- Match 4: RCB vs MI (2023) - MI Powerplay
(4, 2, 'second', 53, 1, 38, 0, '8-9', 29, 2, '14-15');

-- Insert Bowling Scorecard Data
-- Sample bowling performances for matches

-- Match 1: KKR vs RCB (2023) - RCB Bowling (vs KKR)
INSERT INTO BowlingScorecard (match_id, player_id, team_id, overs_bowled, runs_conceded, wickets_taken, maiden_overs, wides, no_balls) VALUES
(1, 52, 4, 4.0, 42, 3, 0, 2, 1), -- Josh Hazlewood
(1, 53, 4, 4.0, 38, 2, 0, 1, 0), -- Wanindu Hasaranga
(1, 54, 4, 4.0, 45, 2, 0, 3, 0), -- Harshal Patel
(1, 51, 4, 4.0, 52, 1, 0, 2, 2), -- Mohammed Siraj
(1, 48, 4, 3.0, 35, 0, 0, 1, 0), -- Glenn Maxwell
(1, 55, 4, 1.0, 18, 0, 0, 1, 0), -- Shahbaz Ahmed

-- Match 1: KKR vs RCB (2023) - KKR Bowling (vs RCB)
(1, 2, 1, 4.0, 32, 2, 0, 1, 1), -- Andre Russell
(1, 7, 1, 4.0, 28, 2, 1, 0, 0), -- Varun Chakaravarthy
(1, 3, 1, 4.0, 35, 2, 0, 2, 0), -- Sunil Narine
(1, 6, 1, 4.0, 38, 2, 0, 3, 1), -- Umesh Yadav
(1, 13, 1, 3.0, 25, 1, 0, 1, 0), -- Harshit Rana
(1, 8, 1, 1.0, 12, 0, 0, 0, 0), -- Venkatesh Iyer

-- Match 2: MI vs CSK (2023) - MI Bowling (vs CSK)
(2, 22, 2, 4.0, 32, 1, 0, 1, 0), -- Jasprit Bumrah
(2, 23, 2, 4.0, 28, 2, 1, 0, 1), -- Trent Boult
(2, 25, 2, 4.0, 45, 1, 0, 2, 0), -- Krunal Pandya
(2, 26, 2, 3.0, 38, 0, 0, 1, 1), -- Hardik Pandya
(2, 27, 2, 3.0, 35, 1, 0, 2, 0), -- Cameron Green
(2, 20, 2, 2.0, 23, 1, 0, 0, 0), -- Tim David

-- Match 2: MI vs CSK (2023) - CSK Bowling (vs MI)
(2, 40, 3, 4.0, 25, 2, 1, 0, 0), -- Matheesha Pathirana
(2, 35, 3, 4.0, 28, 3, 0, 1, 0), -- Ravindra Jadeja
(2, 37, 3, 4.0, 35, 2, 0, 2, 1), -- Deepak Chahar
(2, 39, 3, 4.0, 32, 1, 0, 1, 0), -- Mustafizur Rahman
(2, 36, 3, 3.0, 28, 1, 0, 0, 0), -- Moeen Ali
(2, 43, 3, 1.0, 15, 0, 0, 1, 0), -- Shardul Thakur

-- Match 7: KKR vs CSK (2024) - CSK Bowling (vs KKR)
(7, 40, 3, 4.0, 38, 2, 0, 1, 1), -- Matheesha Pathirana
(7, 37, 3, 4.0, 42, 1, 0, 2, 0), -- Deepak Chahar
(7, 36, 3, 4.0, 35, 1, 0, 1, 0), -- Moeen Ali
(7, 45, 3, 4.0, 28, 1, 1, 0, 0), -- Daryl Mitchell
(7, 35, 3, 3.0, 25, 1, 0, 1, 0), -- Ravindra Jadeja
(7, 41, 3, 1.0, 12, 0, 0, 0, 0), -- Rachin Ravindra

-- Match 7: KKR vs CSK (2024) - KKR Bowling (vs CSK)
(7, 10, 1, 4.0, 28, 3, 1, 0, 0), -- Mitchell Starc
(7, 2, 1, 4.0, 32, 2, 0, 1, 1), -- Andre Russell
(7, 7, 1, 4.0, 35, 2, 0, 2, 0), -- Varun Chakaravarthy
(7, 13, 1, 4.0, 38, 1, 0, 1, 0), -- Harshit Rana
(7, 3, 1, 3.0, 22, 1, 0, 0, 0), -- Sunil Narine
(7, 8, 1, 1.0, 8, 0, 0, 0, 0), -- Venkatesh Iyer

-- Additional bowling figures for other matches
-- Match 3: CSK vs KKR (2023) - CSK Bowling
(3, 37, 3, 4.0, 45, 1, 0, 2, 1), -- Deepak Chahar
(3, 35, 3, 4.0, 38, 2, 0, 1, 0), -- Ravindra Jadeja
(3, 40, 3, 4.0, 32, 1, 1, 0, 0), -- Matheesha Pathirana
(3, 36, 3, 4.0, 42, 0, 0, 3, 1), -- Moeen Ali
(3, 39, 3, 3.0, 28, 1, 0, 1, 0), -- Mustafizur Rahman
(3, 43, 3, 1.0, 15, 0, 0, 0, 0), -- Shardul Thakur

-- Match 3: CSK vs KKR (2023) - KKR Bowling
(3, 6, 1, 4.0, 35, 2, 0, 2, 0), -- Umesh Yadav
(3, 7, 1, 4.0, 42, 1, 0, 1, 1), -- Varun Chakaravarthy
(3, 2, 1, 4.0, 38, 1, 0, 1, 0), -- Andre Russell
(3, 3, 1, 4.0, 28, 2, 1, 0, 0), -- Sunil Narine
(3, 13, 1, 3.0, 25, 0, 0, 1, 0), -- Harshit Rana
(3, 8, 1, 1.0, 12, 0, 0, 0, 0), -- Venkatesh Iyer

-- Match 4: RCB vs MI (2023) - RCB Bowling
(4, 52, 4, 4.0, 32, 2, 1, 0, 0), -- Josh Hazlewood
(4, 51, 4, 4.0, 38, 1, 0, 2, 1), -- Mohammed Siraj
(4, 53, 4, 4.0, 35, 2, 0, 1, 0), -- Wanindu Hasaranga
(4, 54, 4, 4.0, 42, 1, 0, 2, 0), -- Harshal Patel
(4, 48, 4, 3.0, 28, 2, 0, 1, 0), -- Glenn Maxwell
(4, 55, 4, 1.0, 8, 0, 0, 0, 0), -- Shahbaz Ahmed

-- Match 4: RCB vs MI (2023) - MI Bowling
(4, 22, 2, 4.0, 25, 3, 1, 0, 0), -- Jasprit Bumrah
(4, 23, 2, 4.0, 32, 2, 0, 1, 1), -- Trent Boult
(4, 26, 2, 4.0, 38, 1, 0, 2, 0), -- Hardik Pandya
(4, 25, 2, 4.0, 35, 1, 0, 1, 0), -- Krunal Pandya
(4, 27, 2, 3.0, 22, 1, 0, 0, 0), -- Cameron Green
(4, 20, 2, 1.0, 12, 0, 0, 1, 0); -- Tim David

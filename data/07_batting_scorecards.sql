-- Batting Scorecards Sample Data
-- Sample batting performances for completed matches
-- Match 1: MI vs CSK (CSK won by 7 runs)
-- CSK Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (1, 10, 2, 1, 58, 42, 6, 2, TRUE, 'caught', 6),
   (1, 11, 2, 2, 34, 28, 4, 1, TRUE, 'bowled', 6),
   (1, 12, 2, 3, 45, 32, 3, 2, TRUE, 'lbw', 7),
   (1, 13, 2, 4, 29, 24, 2, 1, TRUE, 'caught', 6),
   (1, 14, 2, 5, 18, 15, 1, 1, FALSE, 'not_out', NULL),
   (1, 15, 2, 6, 12, 8, 1, 0, TRUE, 'run_out', NULL),
   -- MI Batting (Second Innings)
   (1, 1, 1, 1, 67, 45, 7, 3, TRUE, 'caught', 14),
   (1, 2, 1, 2, 42, 35, 4, 1, TRUE, 'bowled', 13),
   (1, 3, 1, 3, 28, 22, 2, 1, TRUE, 'lbw', 14),
   (1, 4, 1, 4, 35, 28, 3, 2, FALSE, 'not_out', NULL),
   (1, 5, 1, 5, 15, 12, 1, 0, TRUE, 'caught', 13),
   (1, 6, 1, 6, 8, 6, 1, 0, FALSE, 'not_out', NULL);

-- Match 2: RCB vs KKR (RCB won by 6 wickets)
-- KKR Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (2, 20, 4, 1, 32, 28, 3, 1, TRUE, 'caught', 18),
   (2, 21, 4, 2, 56, 38, 6, 2, TRUE, 'bowled', 19),
   (2, 22, 4, 3, 28, 24, 2, 1, TRUE, 'lbw', 18),
   (2, 23, 4, 4, 41, 31, 4, 1, TRUE, 'caught', 19),
   (2, 24, 4, 5, 15, 12, 1, 0, TRUE, 'stumped', NULL),
   (2, 25, 4, 6, 8, 7, 0, 1, FALSE, 'not_out', NULL),
   -- RCB Batting (Second Innings)
   (2, 15, 3, 1, 73, 48, 8, 3, TRUE, 'caught', 23),
   (2, 16, 3, 2, 45, 32, 5, 1, TRUE, 'bowled', 22),
   (2, 17, 3, 3, 38, 28, 3, 2, FALSE, 'not_out', NULL),
   (2, 18, 3, 4, 25, 18, 2, 1, FALSE, 'not_out', NULL);

-- Match 3: DC vs PBKS (DC won by 15 runs)
-- DC Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (3, 26, 5, 1, 51, 38, 5, 2, TRUE, 'caught', 31),
   (3, 27, 5, 2, 38, 29, 4, 1, TRUE, 'bowled', 32),
   (3, 28, 5, 3, 62, 41, 6, 3, TRUE, 'lbw', 31),
   (3, 29, 5, 4, 29, 23, 2, 1, TRUE, 'caught', 32),
   (3, 30, 5, 5, 18, 14, 1, 1, FALSE, 'not_out', NULL),
   -- PBKS Batting (Second Innings)
   (3, 31, 6, 1, 59, 42, 6, 2, TRUE, 'caught', 29),
   (3, 32, 6, 2, 41, 33, 4, 1, TRUE, 'bowled', 30),
   (3, 33, 6, 3, 35, 28, 3, 1, TRUE, 'lbw', 29),
   (3, 34, 6, 4, 28, 22, 2, 1, TRUE, 'caught', 30),
   (3, 35, 6, 5, 15, 12, 1, 0, TRUE, 'run_out', NULL),
   (3, 31, 6, 6, 7, 5, 0, 0, FALSE, 'not_out', NULL);

-- Match 4: RR vs SRH (SRH won by 4 wickets)
-- RR Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (4, 36, 7, 1, 48, 35, 5, 1, TRUE, 'caught', 40),
   (4, 37, 7, 2, 67, 43, 7, 3, TRUE, 'bowled', 41),
   (4, 38, 7, 3, 32, 26, 3, 1, TRUE, 'lbw', 40),
   (4, 39, 7, 4, 21, 18, 1, 1, TRUE, 'caught', 41),
   (4, 40, 7, 5, 12, 9, 1, 0, TRUE, 'stumped', NULL),
   (4, 36, 7, 6, 8, 6, 0, 1, FALSE, 'not_out', NULL),
   -- SRH Batting (Second Innings)  
   (4, 41, 8, 1, 54, 39, 6, 2, TRUE, 'caught', 39),
   (4, 42, 8, 2, 43, 32, 4, 2, TRUE, 'bowled', 40),
   (4, 43, 8, 3, 38, 28, 3, 1, TRUE, 'lbw', 39),
   (4, 44, 8, 4, 29, 22, 2, 1, FALSE, 'not_out', NULL),
   (4, 45, 8, 5, 15, 11, 1, 1, FALSE, 'not_out', NULL);

-- Match 5: GT vs LSG (GT won by 23 runs)
-- GT Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (5, 46, 9, 1, 58, 41, 6, 2, TRUE, 'caught', 49),
   (5, 47, 9, 2, 71, 47, 8, 3, TRUE, 'bowled', 50),
   (5, 48, 9, 3, 42, 29, 4, 2, TRUE, 'lbw', 49),
   (5, 49, 9, 4, 28, 21, 2, 1, TRUE, 'caught', 50),
   (5, 50, 9, 5, 19, 14, 1, 1, FALSE, 'not_out', NULL),
   -- LSG Batting (Second Innings)
   (5, 51, 10, 1, 46, 34, 5, 1, TRUE, 'caught', 48),
   (5, 52, 10, 2, 39, 31, 4, 1, TRUE, 'bowled', 49),
   (5, 53, 10, 3, 34, 27, 3, 1, TRUE, 'lbw', 48),
   (5, 54, 10, 4, 25, 20, 2, 1, TRUE, 'caught', 49),
   (5, 55, 10, 5, 18, 15, 1, 0, TRUE, 'run_out', NULL),
   (5, 51, 10, 6, 12, 8, 1, 0, FALSE, 'not_out', NULL);

-- IPL 2025 Batting Scorecards
-- Match 30: MI vs CSK (CSK won by 8 runs) - from our new match data
-- MI Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (30, 1, 1, 1, 65, 44, 7, 2, TRUE, 'caught', 14),
   (30, 2, 1, 2, 48, 36, 5, 1, TRUE, 'bowled', 13),
   (30, 3, 1, 3, 34, 28, 3, 1, TRUE, 'lbw', 14),
   (30, 4, 1, 4, 22, 18, 2, 0, TRUE, 'caught', 15),
   (30, 5, 1, 5, 18, 12, 1, 1, FALSE, 'not_out', NULL),
   (30, 6, 1, 6, 9, 7, 1, 0, FALSE, 'not_out', NULL),
   -- CSK Batting (Second Innings)
   (30, 10, 2, 1, 73, 49, 8, 3, TRUE, 'caught', 6),
   (30, 11, 2, 2, 52, 38, 6, 1, TRUE, 'bowled', 7),
   (
      30,
      12,
      2,
      3,
      41,
      31,
      4,
      2,
      FALSE,
      'not_out',
      NULL
   ),
   (30, 13, 2, 4, 28, 22, 2, 1, TRUE, 'caught', 6),
   (30, 14, 2, 5, 12, 8, 1, 0, FALSE, 'not_out', NULL);

-- Match 31: RCB vs SRH (RCB won by 6 wickets)
-- SRH Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (31, 15, 3, 1, 58, 42, 6, 2, TRUE, 'caught', 25),
   (31, 16, 3, 2, 39, 31, 4, 1, TRUE, 'bowled', 24),
   (31, 17, 3, 3, 46, 34, 4, 2, TRUE, 'lbw', 25),
   (31, 18, 3, 4, 31, 25, 3, 1, TRUE, 'caught', 24),
   (31, 19, 3, 5, 22, 18, 2, 0, TRUE, 'run_out', NULL),
   (
      31,
      20,
      3,
      6,
      15,
      11,
      1,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- RCB Batting (Second Innings)
   (31, 20, 4, 1, 67, 45, 7, 3, TRUE, 'caught', 18),
   (31, 21, 4, 2, 43, 32, 5, 1, TRUE, 'bowled', 19),
   (
      31,
      22,
      4,
      3,
      38,
      29,
      3,
      2,
      FALSE,
      'not_out',
      NULL
   ),
   (
      31,
      23,
      4,
      4,
      29,
      23,
      2,
      1,
      FALSE,
      'not_out',
      NULL
   );

-- Match 32: PBKS vs GT (PBKS won by 12 runs)
-- PBKS Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (32, 26, 5, 1, 72, 48, 8, 3, TRUE, 'caught', 35),
   (32, 27, 5, 2, 45, 34, 5, 1, TRUE, 'bowled', 34),
   (32, 28, 5, 3, 38, 28, 3, 2, TRUE, 'lbw', 35),
   (32, 29, 5, 4, 29, 22, 2, 1, TRUE, 'caught', 34),
   (
      32,
      30,
      5,
      5,
      21,
      16,
      2,
      0,
      FALSE,
      'not_out',
      NULL
   ),
   (32, 31, 5, 6, 14, 9, 1, 1, FALSE, 'not_out', NULL),
   -- GT Batting (Second Innings)
   (32, 31, 6, 1, 56, 41, 6, 2, TRUE, 'caught', 29),
   (32, 32, 6, 2, 42, 33, 4, 1, TRUE, 'bowled', 28),
   (32, 33, 6, 3, 35, 27, 3, 1, TRUE, 'lbw', 29),
   (32, 34, 6, 4, 28, 21, 2, 1, TRUE, 'caught', 28),
   (32, 35, 6, 5, 19, 15, 1, 0, TRUE, 'run_out', NULL),
   (32, 36, 6, 6, 8, 6, 1, 0, FALSE, 'not_out', NULL);

-- Match 33: DC vs KKR (KKR won by 5 wickets)  
-- DC Batting (First Innings)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (33, 36, 7, 1, 49, 37, 5, 1, TRUE, 'caught', 44),
   (33, 37, 7, 2, 38, 30, 4, 1, TRUE, 'bowled', 43),
   (33, 38, 7, 3, 42, 32, 4, 2, TRUE, 'lbw', 44),
   (33, 39, 7, 4, 31, 24, 3, 1, TRUE, 'caught', 43),
   (33, 40, 7, 5, 24, 18, 2, 1, TRUE, 'stumped', NULL),
   (
      33,
      41,
      7,
      6,
      16,
      12,
      1,
      0,
      FALSE,
      'not_out',
      NULL
   ),
   -- KKR Batting (Second Innings)
   (33, 41, 8, 1, 68, 46, 7, 3, TRUE, 'caught', 39),
   (33, 42, 8, 2, 47, 35, 5, 1, TRUE, 'bowled', 38),
   (
      33,
      43,
      8,
      3,
      34,
      26,
      3,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   (
      33,
      44,
      8,
      4,
      22,
      17,
      2,
      0,
      FALSE,
      'not_out',
      NULL
   );

-- Match 34: RR vs LSG (LSG won by 7 wickets)
-- RR Batting (First Innings)  
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   (34, 46, 9, 1, 54, 39, 6, 2, TRUE, 'caught', 54),
   (34, 47, 9, 2, 41, 32, 4, 1, TRUE, 'bowled', 53),
   (34, 48, 9, 3, 36, 28, 3, 1, TRUE, 'lbw', 54),
   (34, 49, 9, 4, 27, 21, 2, 1, TRUE, 'caught', 53),
   (34, 50, 9, 5, 18, 14, 1, 0, TRUE, 'run_out', NULL),
   (34, 46, 9, 6, 12, 8, 1, 0, FALSE, 'not_out', NULL),
   -- LSG Batting (Second Innings)
   (34, 51, 10, 1, 71, 48, 8, 3, TRUE, 'caught', 49),
   (34, 52, 10, 2, 46, 34, 5, 1, TRUE, 'bowled', 48),
   (
      34,
      53,
      10,
      3,
      39,
      29,
      3,
      2,
      FALSE,
      'not_out',
      NULL
   ),
   (
      34,
      54,
      10,
      4,
      24,
      18,
      2,
      1,
      FALSE,
      'not_out',
      NULL
   );

-- Additional Batting Scorecard Data for Missing Players (IDs > 55)
-- Mumbai Indians additional players (team_id = 1)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Daniel Sams (56)
   (1, 56, 1, 7, 12, 8, 1, 1, TRUE, 'caught', 14),
   (5, 56, 1, 7, 8, 6, 0, 1, FALSE, 'not_out', NULL),
   -- Ramandeep Singh (57)
   (9, 57, 1, 6, 25, 18, 3, 0, TRUE, 'bowled', 22),
   (
      13,
      57,
      1,
      6,
      18,
      15,
      2,
      0,
      FALSE,
      'not_out',
      NULL
   ),
   -- Tilak Varma (58)
   (1, 58, 1, 4, 34, 26, 4, 1, TRUE, 'lbw', 13),
   (5, 58, 1, 4, 42, 32, 5, 1, FALSE, 'not_out', NULL),
   (9, 58, 1, 4, 28, 22, 3, 0, TRUE, 'caught', 21);

-- Chennai Super Kings additional players (team_id = 2)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Ambati Rayudu (63)
   (2, 63, 2, 3, 45, 35, 5, 1, TRUE, 'caught', 18),
   (6, 63, 2, 3, 32, 28, 3, 1, FALSE, 'not_out', NULL),
   -- Robin Uthappa (64)
   (10, 64, 2, 2, 38, 30, 4, 1, TRUE, 'bowled', 17),
   (14, 64, 2, 2, 29, 24, 3, 0, TRUE, 'lbw', 19),
   -- Moeen Ali (65)
   (2, 65, 2, 6, 22, 16, 2, 1, TRUE, 'caught', 16),
   (6, 65, 2, 6, 18, 12, 1, 1, FALSE, 'not_out', NULL);

-- Royal Challengers Bangalore additional players (team_id = 3)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Dinesh Karthik (71)
   (2, 71, 3, 5, 35, 24, 3, 2, TRUE, 'caught', 12),
   (7, 71, 3, 5, 28, 20, 2, 1, FALSE, 'not_out', NULL),
   -- Rajat Patidar (72)
   (11, 72, 3, 3, 52, 38, 6, 2, TRUE, 'bowled', 25),
   (15, 72, 3, 3, 41, 32, 4, 1, TRUE, 'lbw', 27),
   -- Wanindu Hasaranga (73)
   (2, 73, 3, 7, 15, 12, 1, 1, TRUE, 'caught', 11),
   (7, 73, 3, 8, 8, 6, 0, 1, FALSE, 'not_out', NULL);

-- Kolkata Knight Riders additional players (team_id = 4)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Nitish Rana (79)
   (3, 79, 4, 3, 45, 35, 5, 1, TRUE, 'caught', 15),
   (8, 79, 4, 3, 38, 30, 4, 1, FALSE, 'not_out', NULL),
   -- Rinku Singh (81)
   (12, 81, 4, 5, 28, 22, 3, 0, TRUE, 'bowled', 31),
   (16, 81, 4, 5, 35, 26, 4, 1, TRUE, 'lbw', 33);

-- Delhi Capitals additional players (team_id = 5)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Manish Pandey (87)
   (4, 87, 5, 4, 42, 32, 4, 1, TRUE, 'caught', 42),
   (
      13,
      87,
      5,
      4,
      36,
      28,
      3,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- Mitchell Marsh (89)
   (17, 89, 5, 3, 58, 42, 6, 2, TRUE, 'bowled', 44),
   (21, 89, 5, 3, 34, 26, 3, 1, TRUE, 'lbw', 42);

-- Punjab Kings additional players (team_id = 6)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Nicholas Pooran (95)
   (5, 95, 6, 4, 48, 32, 4, 3, TRUE, 'caught', 3),
   (
      18,
      95,
      6,
      4,
      35,
      25,
      3,
      2,
      FALSE,
      'not_out',
      NULL
   ),
   -- Jonny Bairstow (96)
   (22, 96, 6, 2, 62, 45, 7, 2, TRUE, 'bowled', 43),
   (26, 96, 6, 2, 28, 22, 3, 0, TRUE, 'lbw', 41),
   -- Shahrukh Khan (97)
   (5, 97, 6, 6, 22, 16, 2, 1, TRUE, 'caught', 4),
   (
      18,
      97,
      6,
      6,
      18,
      14,
      1,
      1,
      FALSE,
      'not_out',
      NULL
   );

-- Rajasthan Royals additional players (team_id = 7)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Devdutt Padikkal (103)
   (6, 103, 7, 3, 45, 34, 5, 1, TRUE, 'caught', 12),
   (
      19,
      103,
      7,
      3,
      38,
      30,
      4,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- Shimron Hetmyer (104)
   (23, 104, 7, 5, 32, 24, 3, 1, TRUE, 'bowled', 2),
   (27, 104, 7, 5, 28, 20, 2, 1, TRUE, 'lbw', 4),
   -- Riyan Parag (105)
   (6, 105, 7, 6, 18, 15, 2, 0, TRUE, 'caught', 11),
   (
      19,
      105,
      7,
      6,
      25,
      18,
      3,
      1,
      FALSE,
      'not_out',
      NULL
   );

-- Sunrisers Hyderabad additional players (team_id = 8)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Aiden Markram (111)
   (7, 111, 8, 3, 45, 32, 6, 1, TRUE, 'caught', 16),
   (
      20,
      111,
      8,
      3,
      67,
      48,
      8,
      2,
      FALSE,
      'not_out',
      NULL
   ),
   (24, 111, 8, 3, 28, 22, 3, 0, TRUE, 'bowled', 72),
   (28, 111, 8, 3, 52, 38, 5, 2, TRUE, 'lbw', 74),
   -- Nicholas Pooran (112)
   (7, 112, 8, 4, 38, 25, 4, 2, TRUE, 'caught', 17),
   (
      20,
      112,
      8,
      4,
      56,
      31,
      5,
      3,
      FALSE,
      'not_out',
      NULL
   ),
   (
      24,
      112,
      8,
      4,
      23,
      19,
      2,
      1,
      TRUE,
      'run_out',
      NULL
   ),
   -- Abdul Samad (113)
   (7, 113, 8, 6, 15, 12, 1, 1, TRUE, 'caught', 18),
   (
      20,
      113,
      8,
      6,
      22,
      14,
      2,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   (28, 113, 8, 6, 8, 8, 0, 1, TRUE, 'bowled', 72),
   -- Washington Sundar (114)
   (7, 114, 8, 7, 18, 15, 2, 0, TRUE, 'caught', 16),
   (
      20,
      114,
      8,
      7,
      25,
      18,
      3,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- Marco Jansen (115)
   (
      20,
      115,
      8,
      8,
      12,
      8,
      1,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   (24, 115, 8, 9, 6, 4, 1, 0, TRUE, 'bowled', 73);

-- Gujarat Titans additional players (team_id = 9)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Wriddhiman Saha (119)
   (8, 119, 9, 1, 42, 35, 5, 1, TRUE, 'caught', 20),
   (
      25,
      119,
      9,
      1,
      38,
      32,
      4,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- Vijay Shankar (121)
   (29, 121, 9, 5, 28, 22, 3, 0, TRUE, 'bowled', 43),
   (32, 121, 9, 5, 22, 18, 2, 1, TRUE, 'lbw', 41);

-- Lucknow Super Giants additional players (team_id = 10)
INSERT INTO
   BattingScorecard (
      match_id,
      player_id,
      team_id,
      batting_position,
      runs_scored,
      balls_faced,
      fours,
      sixes,
      is_out,
      out_type,
      bowler_id
   )
VALUES
   -- Krunal Pandya (127)
   (9, 127, 10, 5, 32, 25, 3, 1, TRUE, 'caught', 1),
   (
      30,
      127,
      10,
      5,
      28,
      22,
      2,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- Deepak Hooda (128)
   (33, 128, 10, 4, 45, 34, 5, 1, TRUE, 'bowled', 42),
   (34, 128, 10, 4, 38, 30, 4, 1, TRUE, 'lbw', 44),
   -- Kyle Mayers (129)
   (9, 129, 10, 3, 52, 38, 6, 2, TRUE, 'caught', 2),
   (
      30,
      129,
      10,
      3,
      34,
      26,
      3,
      1,
      FALSE,
      'not_out',
      NULL
   ),
   -- Ayush Badoni (130)
   (33, 130, 10, 6, 18, 15, 2, 0, TRUE, 'caught', 41),
   (
      34,
      130,
      10,
      6,
      22,
      16,
      2,
      1,
      FALSE,
      'not_out',
      NULL
   );

-- Fix player team assignments to match scorecard data
-- This aligns the Players table with the BattingScorecard data
UPDATE Players p
SET
   team_id = (
      SELECT DISTINCT
         bs.team_id
      FROM
         BattingScorecard bs
      WHERE
         bs.player_id = p.player_id
      LIMIT
         1
   )
WHERE
   p.player_id IN (
      SELECT DISTINCT
         player_id
      FROM
         BattingScorecard
   );

-- Verification query to check alignment
SELECT
   CONCAT ('Players with scorecard data aligned: ', COUNT(*)) as alignment_status
FROM
   Players p
WHERE
   p.player_id IN (
      SELECT DISTINCT
         player_id
      FROM
         BattingScorecard
   );

-- Check for any remaining mismatches
SELECT
   CONCAT ('Remaining team mismatches: ', COUNT(*)) as mismatch_status
FROM
   (
      SELECT DISTINCT
         bs.player_id
      FROM
         BattingScorecard bs
         JOIN Players p ON bs.player_id = p.player_id
      WHERE
         bs.team_id != p.team_id
   ) as mismatches;
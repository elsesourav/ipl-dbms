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
-- Bowling Scorecards Sample Data
-- Sample bowling performances for completed matches
-- Match 1: MI vs CSK - CSK Bowling (First Innings when MI batted)
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      runs_conceded,
      wickets_taken,
      maiden_overs,
      wides,
      no_balls
   )
VALUES
   (1, 14, 2, 4.0, 32, 2, 0, 1, 0),
   (1, 13, 2, 4.0, 28, 2, 0, 2, 1),
   (1, 15, 2, 4.0, 35, 1, 0, 1, 0),
   (1, 12, 2, 4.0, 42, 0, 0, 0, 0),
   (1, 11, 2, 4.0, 38, 0, 0, 1, 1),
   -- MI Bowling (Second Innings when CSK batted)
   (1, 6, 1, 4.0, 29, 3, 0, 2, 0),
   (1, 7, 1, 4.0, 31, 2, 0, 1, 1),
   (1, 4, 1, 4.0, 38, 1, 0, 1, 0),
   (1, 3, 1, 4.0, 42, 0, 0, 0, 0),
   (1, 5, 1, 4.0, 36, 0, 0, 2, 0);

-- Match 2: RCB vs KKR - KKR Bowling (First Innings when RCB batted)
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      runs_conceded,
      wickets_taken,
      maiden_overs,
      wides,
      no_balls
   )
VALUES
   (2, 23, 4, 4.0, 35, 2, 0, 1, 0),
   (2, 22, 4, 4.0, 29, 1, 0, 2, 1),
   (2, 24, 4, 4.0, 41, 1, 0, 1, 0),
   (2, 21, 4, 4.0, 38, 0, 0, 0, 0),
   (2, 25, 4, 4.0, 39, 0, 0, 1, 1),
   -- RCB Bowling (Second Innings when KKR batted)
   (2, 18, 3, 4.0, 28, 3, 0, 2, 0),
   (2, 19, 3, 4.0, 32, 2, 0, 1, 1),
   (2, 17, 3, 4.0, 35, 1, 0, 1, 0),
   (2, 16, 3, 4.0, 41, 0, 0, 0, 0),
   (2, 15, 3, 4.0, 44, 0, 0, 2, 0);

-- Match 3: DC vs PBKS - PBKS Bowling (First Innings when DC batted)
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      runs_conceded,
      wickets_taken,
      maiden_overs,
      wides,
      no_balls
   )
VALUES
   (3, 31, 6, 4.0, 38, 2, 0, 1, 0),
   (3, 32, 6, 4.0, 35, 2, 0, 2, 1),
   (3, 34, 6, 4.0, 42, 1, 0, 1, 0),
   (3, 33, 6, 4.0, 45, 0, 0, 0, 0),
   (3, 35, 6, 4.0, 38, 0, 0, 1, 1),
   -- DC Bowling (Second Innings when PBKS batted)
   (3, 29, 5, 4.0, 31, 3, 0, 2, 0),
   (3, 30, 5, 4.0, 34, 2, 0, 1, 1),
   (3, 28, 5, 4.0, 39, 1, 0, 1, 0),
   (3, 27, 5, 4.0, 43, 0, 0, 0, 0),
   (3, 26, 5, 4.0, 38, 0, 0, 2, 0);

-- Match 4: RR vs SRH - SRH Bowling (First Innings when RR batted)
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      runs_conceded,
      wickets_taken,
      maiden_overs,
      wides,
      no_balls
   )
VALUES
   (4, 40, 8, 4.0, 36, 2, 0, 1, 0),
   (4, 41, 8, 4.0, 33, 2, 0, 2, 1),
   (4, 43, 8, 4.0, 41, 1, 0, 1, 0),
   (4, 44, 8, 4.0, 44, 0, 0, 0, 0),
   (4, 45, 8, 4.0, 34, 0, 0, 1, 1),
   -- RR Bowling (Second Innings when SRH batted)
   (4, 39, 7, 4.0, 32, 2, 0, 2, 0),
   (4, 40, 7, 4.0, 36, 1, 0, 1, 1),
   (4, 38, 7, 4.0, 38, 1, 0, 1, 0),
   (4, 37, 7, 4.0, 42, 0, 0, 0, 0),
   (4, 36, 7, 4.0, 31, 0, 0, 2, 0);

-- Match 5: GT vs LSG - LSG Bowling (First Innings when GT batted)
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      runs_conceded,
      wickets_taken,
      maiden_overs,
      wides,
      no_balls
   )
VALUES
   (5, 49, 10, 4.0, 41, 2, 0, 1, 0),
   (5, 50, 10, 4.0, 38, 2, 0, 2, 1),
   (5, 54, 10, 4.0, 45, 1, 0, 1, 0),
   (5, 53, 10, 4.0, 48, 0, 0, 0, 0),
   (5, 55, 10, 4.0, 46, 0, 0, 1, 1),
   -- GT Bowling (Second Innings when LSG batted)
   (5, 48, 9, 4.0, 29, 3, 0, 2, 0),
   (5, 49, 9, 4.0, 32, 2, 0, 1, 1),
   (5, 47, 9, 4.0, 35, 1, 0, 1, 0),
   (5, 46, 9, 4.0, 38, 0, 0, 0, 0),
   (5, 50, 9, 4.0, 36, 0, 0, 2, 0);

-- Additional bowling data for other completed matches
-- Match 6: CSK vs RCB
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      runs_conceded,
      wickets_taken,
      maiden_overs,
      wides,
      no_balls
   )
VALUES
   -- RCB Bowling (CSK batting first)
   (6, 18, 3, 4.0, 34, 2, 0, 1, 0),
   (6, 19, 3, 4.0, 31, 2, 0, 2, 1),
   (6, 17, 3, 4.0, 38, 1, 0, 1, 0),
   (6, 16, 3, 4.0, 41, 0, 0, 0, 0),
   (6, 15, 3, 4.0, 36, 0, 0, 1, 1),
   -- CSK Bowling (RCB batting second)
   (6, 14, 2, 4.0, 28, 3, 0, 2, 0),
   (6, 13, 2, 4.0, 31, 2, 0, 1, 1),
   (6, 15, 2, 4.0, 33, 1, 0, 1, 0),
   (6, 12, 2, 4.0, 37, 0, 0, 0, 0),
   (6, 11, 2, 4.0, 34, 0, 0, 2, 0);
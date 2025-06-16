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

-- IPL 2025 Bowling Scorecards
-- Match 30: MI vs CSK - CSK Bowling (when MI batted first)
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
   (30, 14, 2, 4.0, 38, 2, 0, 1, 0),
   (30, 13, 2, 4.0, 42, 2, 0, 2, 1),
   (30, 15, 2, 4.0, 45, 1, 0, 1, 0),
   (30, 12, 2, 4.0, 48, 0, 0, 0, 0),
   (30, 11, 2, 4.0, 43, 0, 0, 1, 1),
   -- MI Bowling (when CSK batted second)
   (30, 6, 1, 4.0, 41, 2, 0, 2, 0),
   (30, 7, 1, 4.0, 44, 1, 0, 1, 1),
   (30, 4, 1, 4.0, 48, 1, 0, 1, 0),
   (30, 3, 1, 4.0, 52, 0, 0, 0, 0),
   (30, 5, 1, 4.0, 49, 0, 0, 2, 0);

-- Match 31: RCB vs SRH - SRH Bowling (when RCB batted first)
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
   (31, 18, 3, 4.0, 36, 2, 0, 1, 0),
   (31, 19, 3, 4.0, 39, 2, 0, 2, 1),
   (31, 17, 3, 4.0, 42, 1, 0, 1, 0),
   (31, 16, 3, 4.0, 45, 0, 0, 0, 0),
   (31, 15, 3, 4.0, 41, 0, 0, 1, 1),
   -- RCB Bowling (when SRH batted second)
   (31, 24, 4, 4.0, 34, 3, 0, 2, 0),
   (31, 25, 4, 4.0, 37, 2, 0, 1, 1),
   (31, 23, 4, 4.0, 39, 1, 0, 1, 0),
   (31, 22, 4, 4.0, 43, 0, 0, 0, 0),
   (31, 21, 4, 4.0, 40, 0, 0, 2, 0);

-- Match 32: PBKS vs GT - GT Bowling (when PBKS batted first)
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
   (32, 34, 6, 4.0, 43, 2, 0, 1, 0),
   (32, 35, 6, 4.0, 46, 2, 0, 2, 1),
   (32, 33, 6, 4.0, 49, 1, 0, 1, 0),
   (32, 32, 6, 4.0, 52, 0, 0, 0, 0),
   (32, 31, 6, 4.0, 48, 0, 0, 1, 1),
   -- PBKS Bowling (when GT batted second)
   (32, 29, 5, 4.0, 37, 3, 0, 2, 0),
   (32, 28, 5, 4.0, 40, 2, 0, 1, 1),
   (32, 30, 5, 4.0, 42, 1, 0, 1, 0),
   (32, 27, 5, 4.0, 46, 0, 0, 0, 0),
   (32, 26, 5, 4.0, 43, 0, 0, 2, 0);

-- Match 33: DC vs KKR - KKR Bowling (when DC batted first)
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
   (33, 43, 8, 4.0, 40, 2, 0, 1, 0),
   (33, 44, 8, 4.0, 43, 2, 0, 2, 1),
   (33, 42, 8, 4.0, 46, 1, 0, 1, 0),
   (33, 41, 8, 4.0, 49, 0, 0, 0, 0),
   (33, 45, 8, 4.0, 45, 0, 0, 1, 1),
   -- DC Bowling (when KKR batted second)
   (33, 38, 7, 4.0, 35, 2, 0, 2, 0),
   (33, 39, 7, 4.0, 38, 1, 0, 1, 1),
   (33, 37, 7, 4.0, 41, 0, 0, 1, 0),
   (33, 36, 7, 4.0, 44, 0, 0, 0, 0),
   (33, 40, 7, 4.0, 42, 0, 0, 2, 0);

-- Match 34: RR vs LSG - LSG Bowling (when RR batted first)
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
   (34, 53, 10, 4.0, 37, 2, 0, 1, 0),
   (34, 54, 10, 4.0, 40, 2, 0, 2, 1),
   (34, 52, 10, 4.0, 43, 1, 0, 1, 0),
   (34, 51, 10, 4.0, 46, 0, 0, 0, 0),
   (34, 55, 10, 4.0, 42, 0, 0, 1, 1),
   -- RR Bowling (when LSG batted second)
   (34, 48, 9, 4.0, 36, 1, 0, 2, 0),
   (34, 49, 9, 4.0, 39, 0, 0, 1, 1),
   (34, 47, 9, 4.0, 42, 0, 0, 1, 0),
   (34, 46, 9, 4.0, 45, 0, 0, 0, 0),
   (34, 50, 9, 4.0, 41, 0, 0, 2, 0);
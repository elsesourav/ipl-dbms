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

-- Additional Bowling Scorecard Data for Missing Players (IDs > 55)
-- Mumbai Indians additional players bowling
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
   -- Daniel Sams (56)
   (1, 56, 1, 3.0, 25, 1, 0, 1, 0),
   (5, 56, 1, 2.0, 18, 0, 0, 0, 1);

-- Chennai Super Kings additional players bowling
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
   -- Moeen Ali (65)
   (2, 65, 2, 4.0, 32, 1, 0, 1, 0),
   (6, 65, 2, 3.0, 28, 2, 0, 2, 1);

-- Royal Challengers Bangalore additional players bowling  
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
   -- Wanindu Hasaranga (73)
   (2, 73, 3, 4.0, 28, 2, 0, 1, 0),
   (7, 73, 3, 4.0, 35, 1, 0, 2, 1),
   -- Harshal Patel (74)
   (11, 74, 3, 4.0, 32, 2, 0, 1, 0),
   (15, 74, 3, 3.5, 29, 1, 0, 1, 0);

-- Kolkata Knight Riders additional players bowling
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
   -- Varun Chakaravarthy (83)
   (3, 83, 4, 4.0, 30, 2, 0, 1, 0),
   (8, 83, 4, 4.0, 28, 3, 0, 0, 1),
   -- Umesh Yadav (85)
   (12, 85, 4, 4.0, 35, 1, 0, 2, 0),
   (16, 85, 4, 3.0, 28, 2, 0, 1, 1);

-- Delhi Capitals additional players bowling
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
   -- Mitchell Marsh (89)
   (17, 89, 5, 2.0, 18, 0, 0, 1, 0),
   -- Anrich Nortje (91)
   (4, 91, 5, 4.0, 32, 2, 0, 1, 0),
   (13, 91, 5, 4.0, 29, 3, 0, 2, 1),
   -- Kuldeep Yadav (93)
   (17, 93, 5, 4.0, 26, 2, 1, 0, 0),
   (21, 93, 5, 4.0, 31, 1, 0, 1, 0);

-- Punjab Kings additional players bowling
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
   -- Harpreet Brar (99)
   (5, 99, 6, 4.0, 28, 2, 0, 1, 0),
   (18, 99, 6, 3.0, 24, 1, 0, 0, 1),
   -- Kagiso Rabada (101)
   (22, 101, 6, 4.0, 31, 3, 0, 2, 0),
   (26, 101, 6, 4.0, 28, 2, 0, 1, 1);

-- Rajasthan Royals additional players bowling
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
   -- Ravichandran Ashwin (106)
   (6, 106, 7, 4.0, 29, 2, 0, 1, 0),
   (19, 106, 7, 4.0, 32, 1, 0, 2, 1),
   -- Trent Boult (107)
   (23, 107, 7, 4.0, 26, 3, 0, 1, 0),
   (27, 107, 7, 3.5, 24, 2, 0, 0, 0);

-- Sunrisers Hyderabad additional players bowling
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
   -- Aiden Markram (111) - he can bowl spin
   (7, 111, 8, 2.0, 18, 0, 0, 1, 0),
   (20, 111, 8, 1.0, 8, 1, 0, 0, 0),
   -- Washington Sundar (114)
   (7, 114, 8, 4.0, 32, 2, 0, 1, 0),
   (20, 114, 8, 4.0, 28, 1, 0, 2, 1),
   (24, 114, 8, 3.5, 35, 1, 0, 1, 0),
   -- Marco Jansen (115)
   (7, 115, 8, 4.0, 42, 1, 0, 2, 0),
   (20, 115, 8, 3.0, 25, 2, 0, 1, 1),
   (24, 115, 8, 4.0, 38, 2, 0, 1, 0),
   -- Umran Malik (116)
   (28, 116, 8, 4.0, 35, 2, 0, 1, 0),
   -- Kartik Tyagi (117)
   (24, 117, 8, 3.0, 28, 1, 0, 2, 1);

-- Gujarat Titans additional players bowling
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
   -- Rahul Tewatia (122)
   (8, 122, 9, 4.0, 32, 1, 0, 1, 0),
   (25, 122, 9, 3.0, 26, 2, 0, 0, 1),
   -- Lockie Ferguson (123)
   (29, 123, 9, 4.0, 29, 3, 0, 2, 0),
   (32, 123, 9, 4.0, 31, 2, 0, 1, 1);

-- Lucknow Super Giants additional players bowling
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
   -- Krunal Pandya (127)
   (9, 127, 10, 4.0, 30, 1, 0, 1, 0),
   (30, 127, 10, 3.0, 25, 2, 0, 2, 1),
   -- Avesh Khan (132)
   (33, 132, 10, 4.0, 33, 2, 0, 1, 0),
   (34, 132, 10, 4.0, 28, 3, 0, 0, 1),
   -- Mark Wood (133)
   (9, 133, 10, 4.0, 36, 1, 0, 2, 0),
   (30, 133, 10, 3.5, 32, 2, 0, 1, 0);

-- Final verification and cleanup
-- Check data consistency between Players and scorecards
SELECT
   CONCAT (
      'Total players with batting scorecard data: ',
      COUNT(DISTINCT player_id)
   ) as batting_stats
FROM
   BattingScorecard;

SELECT
   CONCAT (
      'Total players with bowling scorecard data: ',
      COUNT(DISTINCT player_id)
   ) as bowling_stats
FROM
   BowlingScorecard;

SELECT
   CONCAT ('Players in both batting and bowling: ', COUNT(*)) as all_rounders
FROM
   (
      SELECT DISTINCT
         b.player_id
      FROM
         BattingScorecard b
         INNER JOIN BowlingScorecard bo ON b.player_id = bo.player_id
   ) as combined;
-- Add sample scorecar-- Add data for Nicholas Pooran (player_id 112, team_id 8 - SRH) 
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
      out_type
   )
VALUES
   (1, 112, 8, 4, 38, 25, 4, 2, 1, 'caught'),
   (5, 112, 8, 4, 56, 31, 5, 3, 0, NULL),
   (9, 112, 8, 4, 23, 19, 2, 1, 1, 'run_out');

or players
with
   IDs > 55 who are missing data
   -- This will provide stats for players like Aiden Markram
   -- Add batting scorecard data for Aiden Markram (player_id 111, team_id 8 - SRH)
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
      out_type
   )
VALUES
   -- Match 1 for Aiden Markram
   (1, 111, 8, 3, 45, 32, 6, 1, 1, 'caught'),
   (5, 111, 8, 3, 28, 22, 3, 0, 1, 'bowled'),
   (9, 111, 8, 3, 67, 48, 8, 2, 0, NULL),
   (13, 111, 8, 3, 12, 15, 1, 0, 1, 'lbw');

-- Add bowling scorecard data for Aiden Markram (he can bowl)
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      maiden_overs,
      runs_conceded,
      wickets_taken,
      economy_rate,
      bowling_figures
   )
VALUES
   (1, 111, 8, 2.0, 0, 18, 0, 9.00, '0/18'),
   (9, 111, 8, 1.0, 0, 8, 1, 8.00, '1/8');

-- Add data for Nicholas Pooran (player_id 112, team_id 8 - SRH) 
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
      strike_rate
   )
VALUES
   (1, 112, 8, 4, 38, 25, 4, 2, 1, 'caught', 152.00),
   (5, 112, 8, 4, 56, 31, 5, 3, 0, NULL, 180.65),
   (9, 112, 8, 4, 23, 19, 2, 1, 1, 'run out', 121.05);

-- Add data for Abdul Samad (player_id 113, team_id 8 - SRH)
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
      out_type
   )
VALUES
   (1, 113, 8, 6, 15, 12, 1, 1, 1, 'caught'),
   (5, 113, 8, 6, 22, 14, 2, 1, 0, NULL),
   (13, 113, 8, 6, 8, 8, 0, 1, 1, 'bowled');

-- Add data for Washington Sundar (player_id 114, team_id 8 - SRH)
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
      out_type
   )
VALUES
   (1, 114, 8, 7, 18, 15, 2, 0, 1, 'caught'),
   (9, 114, 8, 7, 25, 18, 3, 1, 0, NULL);

-- Add bowling data for Washington Sundar
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      maiden_overs,
      runs_conceded,
      wickets_taken,
      economy_rate,
      bowling_figures
   )
VALUES
   (1, 114, 8, 4.0, 1, 32, 2, 8.00, '2/32'),
   (5, 114, 8, 3.5, 0, 28, 1, 7.30, '1/28'),
   (9, 114, 8, 4.0, 0, 35, 1, 8.75, '1/35');

-- Add data for Marco Jansen (player_id 115, team_id 8 - SRH)
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
      out_type
   )
VALUES
   (5, 115, 8, 8, 12, 8, 1, 1, 0, NULL);

-- Add bowling data for Marco Jansen
INSERT INTO
   BowlingScorecard (
      match_id,
      player_id,
      team_id,
      overs_bowled,
      maiden_overs,
      runs_conceded,
      wickets_taken,
      economy_rate,
      bowling_figures
   )
VALUES
   (1, 115, 8, 4.0, 0, 42, 1, 10.50, '1/42'),
   (5, 115, 8, 3.0, 0, 25, 2, 8.33, '2/25'),
   (9, 115, 8, 4.0, 1, 28, 2, 7.00, '2/28');

-- Verify the additions
SELECT
   'Added scorecard data for SRH players:' as status;

SELECT
   player_id,
   COUNT(*) as batting_entries
FROM
   BattingScorecard
WHERE
   player_id IN (111, 112, 113, 114, 115)
GROUP BY
   player_id;

SELECT
   'Bowling entries:' as status;

SELECT
   player_id,
   COUNT(*) as bowling_entries
FROM
   BowlingScorecard
WHERE
   player_id IN (111, 112, 113, 114, 115)
GROUP BY
   player_id;
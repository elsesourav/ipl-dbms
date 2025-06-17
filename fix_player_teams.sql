-- Fix player team assignments to match scorecard data
-- This will align the Players table with the BattingScorecard data
-- Update players based on their scorecard team assignments
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

-- Verify the changes
SELECT
   'After update - Players with scorecard data:' as status;

SELECT
   COUNT(*) as total_players_with_scorecards
FROM
   Players p
WHERE
   p.player_id IN (
      SELECT DISTINCT
         player_id
      FROM
         BattingScorecard
   );

SELECT
   'Remaining mismatches:' as status;

SELECT
   COUNT(*) as remaining_mismatches
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
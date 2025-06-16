-- Selective Data Loader Script
-- This script allows loading specific data sets individually
-- Uncomment the sections you want to load:
-- Basic setup data (required for most other data)
-- SOURCE 01_teams.sql;
-- SOURCE 02_stadiums.sql;
-- SOURCE 03_series.sql;
-- SOURCE 04_umpires.sql;
-- Player data (requires teams to be loaded first)
-- SOURCE 05_players.sql;
-- Match data (requires teams, stadiums, series, umpires, and players)
-- SOURCE 06_matches.sql;
-- Scorecard data (requires matches and players)
-- SOURCE 07_batting_scorecards.sql;
-- SOURCE 08_bowling_scorecards.sql;
-- Statistics data (requires teams, players, and series)
-- SOURCE 09_team_stats.sql;
-- SOURCE 10_player_stats.sql;
-- User authentication data (independent)
-- SOURCE 11_users.sql;
-- Examples of selective loading:
-- Load only basic setup data:
-- SOURCE 01_teams.sql;
-- SOURCE 02_stadiums.sql;
-- SOURCE 03_series.sql;
-- SOURCE 04_umpires.sql;
-- SOURCE 11_users.sql;
-- Load only player-related data (after basic setup):
-- SOURCE 05_players.sql;
-- SOURCE 10_player_stats.sql;
-- Load only match-related data (after basic setup and players):
-- SOURCE 06_matches.sql;
-- SOURCE 07_batting_scorecards.sql;
-- SOURCE 08_bowling_scorecards.sql;
-- Load only statistics:
-- SOURCE 09_team_stats.sql;
-- SOURCE 10_player_stats.sql;
SELECT
   'Selective data loading script ready.' AS message;

SELECT
   'Uncomment the SOURCE commands for the data you want to load.' AS instruction;
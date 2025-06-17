-- Insert Team Statistics Data
-- Team performance statistics for 2023 and 2024 seasons
-- IPL 2023 Team Statistics
INSERT INTO
   TeamStats (
      team_id,
      series_id,
      matches_played,
      matches_won,
      matches_lost,
      no_results,
      points,
      net_run_rate
   )
VALUES
   -- KKR 2023 Season
   (1, 1, 14, 7, 7, 0, 14, 0.15),
   -- Mumbai Indians 2023 Season  
   (2, 1, 14, 4, 10, 0, 8, -0.34),
   -- Chennai Super Kings 2023 Season (Champions)
   (3, 1, 16, 12, 4, 0, 24, 0.62),
   -- Royal Challengers Bangalore 2023 Season
   (4, 1, 14, 8, 6, 0, 16, 0.22);

-- IPL 2024 Team Statistics
INSERT INTO
   TeamStats (
      team_id,
      series_id,
      matches_played,
      matches_won,
      matches_lost,
      no_results,
      points,
      net_run_rate
   )
VALUES
   -- KKR 2024 Season (Champions)
   (1, 2, 16, 13, 3, 0, 26, 0.85),
   -- Mumbai Indians 2024 Season
   (2, 2, 14, 6, 8, 0, 12, -0.18),
   -- Chennai Super Kings 2024 Season
   (3, 2, 14, 8, 6, 0, 16, 0.28),
   -- Royal Challengers Bangalore 2024 Season
   (4, 2, 14, 7, 7, 0, 14, 0.05);
-- Team Statistics Sample Data
-- Team performance statistics for IPL seasons
-- IPL 2024 Team Stats (series_id = 1) - Sample data based on completed matches
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
   -- Mumbai Indians - IPL 2024 Champions
   (1, 1, 16, 11, 5, 0, 22, 0.85),
   -- Chennai Super Kings - Runners-up
   (2, 1, 16, 10, 6, 0, 20, 0.42),
   -- Royal Challengers Bangalore
   (3, 1, 14, 8, 6, 0, 16, 0.15),
   -- Kolkata Knight Riders
   (4, 1, 15, 8, 7, 0, 16, -0.18),
   -- Delhi Capitals
   (5, 1, 14, 7, 7, 0, 14, 0.32),
   -- Punjab Kings
   (6, 1, 14, 6, 8, 0, 12, -0.25),
   -- Rajasthan Royals
   (7, 1, 14, 6, 8, 0, 12, -0.15),
   -- Sunrisers Hyderabad
   (8, 1, 14, 5, 9, 0, 10, -0.42),
   -- Gujarat Titans
   (9, 1, 14, 4, 10, 0, 8, -0.68),
   -- Lucknow Super Giants
   (10, 1, 14, 3, 11, 0, 6, -0.89);

-- IPL 2025 Team Stats (series_id = 2) - Empty/Initial data as season hasn't started
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
   (1, 2, 0, 0, 0, 0, 0, 0.00),
   (2, 2, 0, 0, 0, 0, 0, 0.00),
   (3, 2, 0, 0, 0, 0, 0, 0.00),
   (4, 2, 0, 0, 0, 0, 0, 0.00),
   (5, 2, 0, 0, 0, 0, 0, 0.00),
   (6, 2, 0, 0, 0, 0, 0, 0.00),
   (7, 2, 0, 0, 0, 0, 0, 0.00),
   (8, 2, 0, 0, 0, 0, 0, 0.00),
   (9, 2, 0, 0, 0, 0, 0, 0.00),
   (10, 2, 0, 0, 0, 0, 0, 0.00);

-- Historical seasons - IPL 2023 (series_id = 3)
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
   (2, 3, 16, 12, 4, 0, 24, 0.65), -- CSK Champions 2023
   (9, 3, 16, 10, 6, 0, 20, 0.35), -- GT Runners-up
   (1, 3, 14, 8, 6, 0, 16, 0.18), -- MI
   (4, 3, 14, 7, 7, 0, 14, -0.02), -- KKR
   (3, 3, 14, 7, 7, 0, 14, -0.12), -- RCB
   (7, 3, 14, 6, 8, 0, 12, -0.28), -- RR
   (5, 3, 14, 5, 9, 0, 10, -0.35), -- DC
   (10, 3, 14, 5, 9, 0, 10, -0.47), -- LSG
   (6, 3, 14, 4, 10, 0, 8, -0.62), -- PBKS
   (8, 3, 14, 4, 10, 0, 8, -0.71);

-- SRH
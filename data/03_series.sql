-- Series Sample Data
-- IPL seasons/tournaments with actual match data or team statistics
INSERT INTO
   Series (
      series_name,
      season_year,
      start_date,
      end_date,
      total_matches,
      is_completed
   )
VALUES
   (
      'Indian Premier League 2024',
      2024,
      '2024-03-22',
      '2024-05-26',
      74,
      TRUE
   ),
   (
      'Indian Premier League 2025',
      2025,
      '2025-03-20',
      '2025-05-26',
      74,
      TRUE
   ),
   (
      'Indian Premier League 2023',
      2023,
      '2023-03-31',
      '2023-05-28',
      74,
      TRUE
   );
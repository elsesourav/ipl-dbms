-- Series Sample Data
-- IPL seasons/tournaments
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
      '2025-05-25',
      74,
      FALSE
   ),
   (
      'Indian Premier League 2023',
      2023,
      '2023-03-31',
      '2023-05-28',
      74,
      TRUE
   ),
   (
      'Indian Premier League 2022',
      2022,
      '2022-03-26',
      '2022-05-29',
      74,
      TRUE
   ),
   (
      'Indian Premier League 2021',
      2021,
      '2021-04-09',
      '2021-10-15',
      60,
      TRUE
   );
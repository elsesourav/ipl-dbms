-- Insert Batting Scorecard Data
-- Sample batting performances for matches
-- Match 1: KKR vs RCB (2023) - KKR Batting (First Innings)
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
      bowler_id,
      fielder_id
   )
VALUES
   (1, 8, 1, 1, 67, 49, 8, 2, TRUE, 'caught', 52, 48), -- Venkatesh Iyer
   (
      1,
      1,
      1,
      2,
      85,
      51,
      9,
      4,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Shreyas Iyer
   (
      1,
      4,
      1,
      3,
      45,
      32,
      4,
      1,
      TRUE,
      'run_out',
      NULL,
      47
   ), -- Nitish Rana
   (
      1,
      5,
      1,
      4,
      23,
      18,
      2,
      1,
      TRUE,
      'bowled',
      53,
      NULL
   ), -- Rinku Singh
   (
      1,
      2,
      1,
      5,
      15,
      8,
      1,
      1,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Andre Russell
   (1, 3, 1, 6, 0, 1, 0, 0, TRUE, 'lbw', 54, NULL), -- Sunil Narine
   (1, 9, 1, 7, 12, 8, 2, 0, TRUE, 'caught', 52, 49), -- Rahmanullah Gurbaz
   (1, 12, 1, 8, 8, 5, 1, 0, TRUE, 'bowled', 53, NULL), -- Ramandeep Singh
   (1, 7, 1, 9, 0, 2, 0, 0, TRUE, 'caught', 54, 46), -- Varun Chakaravarthy
   (
      1,
      6,
      1,
      10,
      5,
      3,
      1,
      0,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Umesh Yadav
   (
      1,
      13,
      1,
      11,
      0,
      1,
      0,
      0,
      TRUE,
      'bowled',
      52,
      NULL
   ), -- Harshit Rana
   -- Match 1: KKR vs RCB (2023) - RCB Batting (Second Innings)
   (1, 47, 4, 1, 32, 28, 4, 0, TRUE, 'caught', 2, 1), -- Faf du Plessis
   (1, 46, 4, 2, 61, 44, 6, 2, TRUE, 'lbw', 7, NULL), -- Virat Kohli
   (1, 48, 4, 3, 28, 19, 2, 2, TRUE, 'caught', 3, 5), -- Glenn Maxwell
   (
      1,
      50,
      4,
      4,
      35,
      31,
      3,
      1,
      TRUE,
      'run_out',
      NULL,
      4
   ), -- Rajat Patidar
   (1, 49, 4, 5, 12, 15, 1, 0, TRUE, 'stumped', 3, 9), -- Dinesh Karthik
   (1, 55, 4, 6, 18, 14, 2, 0, TRUE, 'caught', 6, 2), -- Shahbaz Ahmed
   (1, 53, 4, 7, 8, 7, 1, 0, TRUE, 'bowled', 13, NULL), -- Wanindu Hasaranga
   (1, 54, 4, 8, 5, 4, 1, 0, TRUE, 'caught', 7, 8), -- Harshal Patel
   (1, 51, 4, 9, 2, 3, 0, 0, TRUE, 'lbw', 6, NULL), -- Mohammed Siraj
   (1, 52, 4, 10, 0, 2, 0, 0, TRUE, 'bowled', 2, NULL), -- Josh Hazlewood
   (
      1,
      56,
      4,
      11,
      1,
      1,
      0,
      0,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Mahipal Lomror
   -- Match 2: MI vs CSK (2023) - CSK Batting (First Innings)
   (
      2,
      32,
      3,
      1,
      92,
      58,
      7,
      4,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Ruturaj Gaikwad
   (2, 33, 3, 2, 38, 25, 5, 1, TRUE, 'caught', 23, 17), -- Devon Conway
   (
      2,
      35,
      3,
      3,
      25,
      18,
      2,
      1,
      TRUE,
      'run_out',
      NULL,
      19
   ), -- Ravindra Jadeja
   (
      2,
      34,
      3,
      4,
      15,
      12,
      1,
      1,
      TRUE,
      'bowled',
      22,
      NULL
   ), -- Shivam Dube
   (2, 31, 3, 5, 18, 14, 2, 0, TRUE, 'caught', 25, 20), -- MS Dhoni
   (2, 36, 3, 6, 8, 6, 1, 0, TRUE, 'lbw', 22, NULL), -- Moeen Ali
   (
      2,
      43,
      3,
      7,
      5,
      4,
      1,
      0,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Shardul Thakur
   (2, 37, 3, 8, 0, 1, 0, 0, TRUE, 'bowled', 23, NULL), -- Deepak Chahar
   -- Match 2: MI vs CSK (2023) - MI Batting (Second Innings)
   (2, 16, 2, 1, 45, 32, 6, 1, TRUE, 'caught', 37, 35), -- Rohit Sharma
   (
      2,
      17,
      2,
      2,
      23,
      18,
      2,
      1,
      TRUE,
      'stumped',
      36,
      31
   ), -- Ishan Kishan
   (2, 18, 2, 3, 31, 22, 4, 0, TRUE, 'lbw', 35, NULL), -- Suryakumar Yadav
   (2, 19, 2, 4, 28, 25, 2, 1, TRUE, 'caught', 40, 33), -- Tilak Varma
   (
      2,
      26,
      2,
      5,
      18,
      14,
      1,
      1,
      TRUE,
      'bowled',
      35,
      NULL
   ), -- Hardik Pandya
   (
      2,
      20,
      2,
      6,
      15,
      12,
      1,
      1,
      TRUE,
      'run_out',
      NULL,
      32
   ), -- Tim David
   (2, 27, 2, 7, 12, 8, 2, 0, TRUE, 'caught', 39, 34), -- Cameron Green
   (2, 25, 2, 8, 8, 7, 1, 0, TRUE, 'lbw', 35, NULL), -- Krunal Pandya
   (
      2,
      22,
      2,
      9,
      5,
      4,
      1,
      0,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Jasprit Bumrah
   (
      2,
      23,
      2,
      10,
      2,
      3,
      0,
      0,
      TRUE,
      'bowled',
      40,
      NULL
   ), -- Trent Boult
   -- Match 7: KKR vs CSK (2024) - KKR Batting (First Innings)
   (7, 11, 1, 1, 54, 38, 6, 2, TRUE, 'caught', 37, 33), -- Phil Salt
   (7, 3, 1, 2, 32, 21, 4, 1, TRUE, 'lbw', 40, NULL), -- Sunil Narine
   (
      7,
      8,
      1,
      3,
      25,
      18,
      3,
      0,
      TRUE,
      'run_out',
      NULL,
      35
   ), -- Venkatesh Iyer
   (7, 1, 1, 4, 42, 31, 4, 1, TRUE, 'caught', 36, 41), -- Shreyas Iyer
   (
      7,
      5,
      1,
      5,
      28,
      16,
      2,
      2,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Rinku Singh
   (
      7,
      2,
      1,
      6,
      15,
      8,
      1,
      1,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Andre Russell
   (7, 4, 1, 7, 8, 6, 1, 0, TRUE, 'bowled', 45, NULL), -- Nitish Rana
   (7, 12, 1, 8, 5, 4, 1, 0, TRUE, 'caught', 40, 32), -- Ramandeep Singh
   -- Match 7: KKR vs CSK (2024) - CSK Batting (Second Innings)
   (7, 32, 3, 1, 38, 28, 4, 1, TRUE, 'caught', 10, 11), -- Ruturaj Gaikwad
   (
      7,
      41,
      3,
      2,
      35,
      22,
      5,
      1,
      TRUE,
      'bowled',
      7,
      NULL
   ), -- Rachin Ravindra
   (7, 45, 3, 3, 31, 25, 3, 1, TRUE, 'lbw', 2, NULL), -- Daryl Mitchell
   (7, 34, 3, 4, 28, 21, 2, 1, TRUE, 'caught', 13, 1), -- Shivam Dube
   (
      7,
      31,
      3,
      5,
      18,
      15,
      2,
      0,
      TRUE,
      'run_out',
      NULL,
      5
   ), -- MS Dhoni
   (7, 35, 3, 6, 12, 9, 1, 0, TRUE, 'caught', 2, 8), -- Ravindra Jadeja
   (7, 36, 3, 7, 8, 7, 1, 0, TRUE, 'bowled', 10, NULL), -- Moeen Ali
   (
      7,
      37,
      3,
      8,
      5,
      4,
      1,
      0,
      FALSE,
      'not_out',
      NULL,
      NULL
   ), -- Deepak Chahar
   (7, 40, 3, 9, 2, 3, 0, 0, TRUE, 'caught', 13, 4);

-- Matheesha Pathirana
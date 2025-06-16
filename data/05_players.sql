-- Players Sample Data
-- IPL players across different teams
-- Mumbai Indians Players
INSERT INTO
   Players (
      player_name,
      date_of_birth,
      nationality,
      role,
      batting_style,
      bowling_style,
      jersey_number,
      price_crores,
      team_id
   )
VALUES
   -- Mumbai Indians (team_id = 1)
   (
      'Rohit Sharma',
      '1987-04-30',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      45,
      16.30,
      1
   ),
   (
      'Ishan Kishan',
      '1998-07-18',
      'India',
      'Wicket-keeper',
      'Left-handed',
      NULL,
      23,
      15.25,
      1
   ),
   (
      'Suryakumar Yadav',
      '1990-09-14',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      63,
      8.00,
      1
   ),
   (
      'Hardik Pandya',
      '1993-10-11',
      'India',
      'All-rounder',
      'Right-handed',
      'Right-arm medium',
      33,
      15.00,
      1
   ),
   (
      'Kieron Pollard',
      '1987-05-12',
      'West Indies',
      'All-rounder',
      'Right-handed',
      'Right-arm medium',
      55,
      5.40,
      1
   ),
   (
      'Jasprit Bumrah',
      '1993-12-06',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      93,
      7.00,
      1
   ),
   (
      'Trent Boult',
      '1989-07-22',
      'New Zealand',
      'Bowler',
      'Left-handed',
      'Left-arm fast',
      18,
      8.00,
      1
   ),
   -- Chennai Super Kings (team_id = 2)
   (
      'MS Dhoni',
      '1981-07-07',
      'India',
      'Wicket-keeper',
      'Right-handed',
      NULL,
      7,
      12.00,
      2
   ),
   (
      'Ruturaj Gaikwad',
      '1997-01-31',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      31,
      6.00,
      2
   ),
   (
      'Faf du Plessis',
      '1984-07-13',
      'South Africa',
      'Batsman',
      'Right-handed',
      NULL,
      18,
      7.00,
      2
   ),
   (
      'Ravindra Jadeja',
      '1988-12-06',
      'India',
      'All-rounder',
      'Left-handed',
      'Left-arm orthodox',
      8,
      16.00,
      2
   ),
   (
      'Deepak Chahar',
      '1992-08-07',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm medium',
      90,
      14.00,
      2
   ),
   (
      'Dwayne Bravo',
      '1983-10-07',
      'West Indies',
      'All-rounder',
      'Right-handed',
      'Right-arm medium',
      47,
      4.40,
      2
   ),
   -- Royal Challengers Bangalore (team_id = 3)
   (
      'Virat Kohli',
      '1988-11-05',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      18,
      15.00,
      3
   ),
   (
      'AB de Villiers',
      '1984-02-17',
      'South Africa',
      'Batsman',
      'Right-handed',
      NULL,
      17,
      11.00,
      3
   ),
   (
      'Glenn Maxwell',
      '1988-10-14',
      'Australia',
      'All-rounder',
      'Right-handed',
      'Right-arm off-break',
      32,
      11.00,
      3
   ),
   (
      'Mohammed Siraj',
      '1994-03-13',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      73,
      7.00,
      3
   ),
   (
      'Yuzvendra Chahal',
      '1990-07-23',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm leg-break',
      3,
      6.50,
      3
   ),
   (
      'Josh Hazlewood',
      '1991-01-08',
      'Australia',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      8,
      7.75,
      3
   ),
   -- Kolkata Knight Riders (team_id = 4)
   (
      'Shreyas Iyer',
      '1994-12-06',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      41,
      12.25,
      4
   ),
   (
      'Andre Russell',
      '1988-04-29',
      'West Indies',
      'All-rounder',
      'Right-handed',
      'Right-arm fast',
      12,
      12.00,
      4
   ),
   (
      'Sunil Narine',
      '1988-05-26',
      'West Indies',
      'All-rounder',
      'Left-handed',
      'Right-arm off-break',
      74,
      6.00,
      4
   ),
   (
      'Pat Cummins',
      '1993-05-08',
      'Australia',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      30,
      7.25,
      4
   ),
   (
      'Venkatesh Iyer',
      '1994-12-25',
      'India',
      'All-rounder',
      'Left-handed',
      'Right-arm medium',
      20,
      8.00,
      4
   ),
   -- Delhi Capitals (team_id = 5)
   (
      'Rishabh Pant',
      '1997-10-04',
      'India',
      'Wicket-keeper',
      'Left-handed',
      NULL,
      17,
      16.00,
      5
   ),
   (
      'Prithvi Shaw',
      '1999-11-09',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      25,
      7.50,
      5
   ),
   (
      'David Warner',
      '1986-10-27',
      'Australia',
      'Batsman',
      'Left-handed',
      NULL,
      31,
      6.25,
      5
   ),
   (
      'Axar Patel',
      '1994-01-20',
      'India',
      'All-rounder',
      'Left-handed',
      'Left-arm orthodox',
      20,
      9.00,
      5
   ),
   (
      'Kagiso Rabada',
      '1995-05-25',
      'South Africa',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      25,
      4.20,
      5
   ),
   -- Punjab Kings (team_id = 6)
   (
      'KL Rahul',
      '1992-04-18',
      'India',
      'Wicket-keeper',
      'Right-handed',
      NULL,
      1,
      17.00,
      6
   ),
   (
      'Mayank Agarwal',
      '1991-02-16',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      12,
      12.00,
      6
   ),
   (
      'Chris Gayle',
      '1979-09-21',
      'West Indies',
      'Batsman',
      'Left-handed',
      'Right-arm off-break',
      333,
      2.00,
      6
   ),
   (
      'Mohammed Shami',
      '1990-09-03',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      11,
      5.25,
      6
   ),
   (
      'Arshdeep Singh',
      '1999-02-05',
      'India',
      'Bowler',
      'Left-handed',
      'Left-arm fast',
      2,
      4.00,
      6
   ),
   -- Rajasthan Royals (team_id = 7)
   (
      'Sanju Samson',
      '1994-11-11',
      'India',
      'Wicket-keeper',
      'Right-handed',
      NULL,
      9,
      14.00,
      7
   ),
   (
      'Jos Buttler',
      '1990-09-08',
      'England',
      'Wicket-keeper',
      'Right-handed',
      NULL,
      63,
      10.00,
      7
   ),
   (
      'Ben Stokes',
      '1991-06-04',
      'England',
      'All-rounder',
      'Left-handed',
      'Right-arm fast',
      55,
      12.50,
      7
   ),
   (
      'Jofra Archer',
      '1995-04-01',
      'England',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      22,
      8.00,
      7
   ),
   (
      'Yuzvendra Chahal',
      '1990-07-23',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm leg-break',
      3,
      6.50,
      7
   ),
   -- Sunrisers Hyderabad (team_id = 8)
   (
      'Kane Williamson',
      '1990-08-08',
      'New Zealand',
      'Batsman',
      'Right-handed',
      'Right-arm off-break',
      2,
      14.00,
      8
   ),
   (
      'David Warner',
      '1986-10-27',
      'Australia',
      'Batsman',
      'Left-handed',
      NULL,
      31,
      5.50,
      8
   ),
   (
      'Rashid Khan',
      '1998-09-20',
      'Afghanistan',
      'Bowler',
      'Right-handed',
      'Right-arm leg-break',
      19,
      9.00,
      8
   ),
   (
      'Bhuvneshwar Kumar',
      '1990-02-05',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm medium',
      15,
      4.20,
      8
   ),
   (
      'T Natarajan',
      '1991-05-27',
      'India',
      'Bowler',
      'Left-handed',
      'Left-arm fast',
      91,
      4.00,
      8
   ),
   -- Gujarat Titans (team_id = 9)
   (
      'Hardik Pandya',
      '1993-10-11',
      'India',
      'All-rounder',
      'Right-handed',
      'Right-arm medium',
      33,
      15.00,
      9
   ),
   (
      'Shubman Gill',
      '1999-10-08',
      'India',
      'Batsman',
      'Right-handed',
      NULL,
      77,
      8.00,
      9
   ),
   (
      'Rashid Khan',
      '1998-09-20',
      'Afghanistan',
      'Bowler',
      'Right-handed',
      'Right-arm leg-break',
      19,
      15.00,
      9
   ),
   (
      'Mohammed Shami',
      '1990-09-03',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      11,
      6.25,
      9
   ),
   (
      'David Miller',
      '1989-06-10',
      'South Africa',
      'Batsman',
      'Left-handed',
      NULL,
      32,
      3.00,
      9
   ),
   -- Lucknow Super Giants (team_id = 10)
   (
      'KL Rahul',
      '1992-04-18',
      'India',
      'Wicket-keeper',
      'Right-handed',
      NULL,
      1,
      17.00,
      10
   ),
   (
      'Quinton de Kock',
      '1992-12-17',
      'South Africa',
      'Wicket-keeper',
      'Left-handed',
      NULL,
      12,
      6.75,
      10
   ),
   (
      'Marcus Stoinis',
      '1989-08-16',
      'Australia',
      'All-rounder',
      'Right-handed',
      'Right-arm fast',
      32,
      9.20,
      10
   ),
   (
      'Kagiso Rabada',
      '1995-05-25',
      'South Africa',
      'Bowler',
      'Right-handed',
      'Right-arm fast',
      25,
      9.25,
      10
   ),
   (
      'Ravi Bishnoi',
      '2000-09-05',
      'India',
      'Bowler',
      'Right-handed',
      'Right-arm leg-break',
      23,
      4.00,
      10
   );
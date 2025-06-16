-- IPL Database Management System
-- Based on the cricket database structure with IPL-specific modifications
CREATE DATABASE IF NOT EXISTS ipl_database;

USE ipl_database;

-- Teams Table
CREATE TABLE
   Teams (
      team_id INT PRIMARY KEY AUTO_INCREMENT,
      team_name VARCHAR(100) NOT NULL,
      team_code VARCHAR(10) NOT NULL UNIQUE,
      city VARCHAR(50) NOT NULL,
      founded_year INT,
      owner VARCHAR(100),
      captain_id INT,
      coach VARCHAR(100),
      home_ground VARCHAR(100),
      team_color VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

-- Players Table
CREATE TABLE
   Players (
      player_id INT PRIMARY KEY AUTO_INCREMENT,
      player_name VARCHAR(100) NOT NULL,
      date_of_birth DATE,
      nationality VARCHAR(50),
      role ENUM (
         'Batsman',
         'Bowler',
         'All-rounder',
         'Wicket-keeper'
      ) NOT NULL,
      batting_style ENUM ('Right-handed', 'Left-handed'),
      bowling_style VARCHAR(50),
      jersey_number INT,
      price_crores DECIMAL(10, 2),
      team_id INT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES Teams (team_id) ON DELETE SET NULL
   );

-- Stadiums Table
CREATE TABLE
   Stadiums (
      stadium_id INT PRIMARY KEY AUTO_INCREMENT,
      stadium_name VARCHAR(100) NOT NULL,
      city VARCHAR(50) NOT NULL,
      state VARCHAR(50),
      country VARCHAR(50) DEFAULT 'India',
      capacity INT,
      established_year INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

-- Series Table (IPL Seasons)
CREATE TABLE
   Series (
      series_id INT PRIMARY KEY AUTO_INCREMENT,
      series_name VARCHAR(100) NOT NULL,
      season_year INT NOT NULL,
      start_date DATE,
      end_date DATE,
      format ENUM ('T20') DEFAULT 'T20',
      authority VARCHAR(50) DEFAULT 'BCCI',
      num_teams INT DEFAULT 10,
      total_matches INT,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

-- Umpires Table
CREATE TABLE
   Umpires (
      umpire_id INT PRIMARY KEY AUTO_INCREMENT,
      umpire_name VARCHAR(100) NOT NULL,
      nationality VARCHAR(50),
      experience_years INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

-- Matches Table
CREATE TABLE
   Matches (
      match_id INT PRIMARY KEY AUTO_INCREMENT,
      series_id INT NOT NULL,
      match_number INT,
      match_type ENUM (
         'league',
         'qualifier1',
         'qualifier2',
         'eliminator',
         'final'
      ) DEFAULT 'league',
      team1_id INT NOT NULL,
      team2_id INT NOT NULL,
      stadium_id INT NOT NULL,
      match_date DATE NOT NULL,
      match_time TIME,
      toss_winner_id INT,
      toss_decision ENUM ('bat', 'bowl'),
      winner_id INT,
      win_type ENUM ('runs', 'wickets', 'no_result') DEFAULT 'runs',
      win_margin INT,
      man_of_match_id INT,
      umpire1_id INT,
      umpire2_id INT,
      third_umpire_id INT,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (series_id) REFERENCES Series (series_id) ON DELETE CASCADE,
      FOREIGN KEY (team1_id) REFERENCES Teams (team_id),
      FOREIGN KEY (team2_id) REFERENCES Teams (team_id),
      FOREIGN KEY (stadium_id) REFERENCES Stadiums (stadium_id),
      FOREIGN KEY (toss_winner_id) REFERENCES Teams (team_id),
      FOREIGN KEY (winner_id) REFERENCES Teams (team_id),
      FOREIGN KEY (man_of_match_id) REFERENCES Players (player_id),
      FOREIGN KEY (umpire1_id) REFERENCES Umpires (umpire_id),
      FOREIGN KEY (umpire2_id) REFERENCES Umpires (umpire_id),
      FOREIGN KEY (third_umpire_id) REFERENCES Umpires (umpire_id)
   );

-- Batting Scorecard Table
CREATE TABLE
   BattingScorecard (
      scorecard_id INT PRIMARY KEY AUTO_INCREMENT,
      match_id INT NOT NULL,
      player_id INT NOT NULL,
      team_id INT NOT NULL,
      batting_position INT,
      runs_scored INT DEFAULT 0,
      balls_faced INT DEFAULT 0,
      fours INT DEFAULT 0,
      sixes INT DEFAULT 0,
      is_out BOOLEAN DEFAULT FALSE,
      out_type ENUM (
         'bowled',
         'caught',
         'lbw',
         'run_out',
         'stumped',
         'hit_wicket',
         'not_out'
      ) DEFAULT 'not_out',
      bowler_id INT,
      fielder_id INT,
      strike_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
         CASE
            WHEN balls_faced > 0 THEN (runs_scored * 100.0 / balls_faced)
            ELSE 0
         END
      ) STORED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES Matches (match_id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES Players (player_id),
      FOREIGN KEY (team_id) REFERENCES Teams (team_id),
      FOREIGN KEY (bowler_id) REFERENCES Players (player_id),
      FOREIGN KEY (fielder_id) REFERENCES Players (player_id)
   );

-- Bowling Scorecard Table
CREATE TABLE
   BowlingScorecard (
      scorecard_id INT PRIMARY KEY AUTO_INCREMENT,
      match_id INT NOT NULL,
      player_id INT NOT NULL,
      team_id INT NOT NULL,
      overs_bowled DECIMAL(3, 1) DEFAULT 0,
      runs_conceded INT DEFAULT 0,
      wickets_taken INT DEFAULT 0,
      maiden_overs INT DEFAULT 0,
      wides INT DEFAULT 0,
      no_balls INT DEFAULT 0,
      economy_rate DECIMAL(4, 2) GENERATED ALWAYS AS (
         CASE
            WHEN overs_bowled > 0 THEN (runs_conceded / overs_bowled)
            ELSE 0
         END
      ) STORED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES Matches (match_id) ON DELETE CASCADE,
      FOREIGN KEY (player_id) REFERENCES Players (player_id),
      FOREIGN KEY (team_id) REFERENCES Teams (team_id)
   );

-- Team Statistics Table
CREATE TABLE
   TeamStats (
      team_id INT NOT NULL,
      series_id INT NOT NULL,
      matches_played INT DEFAULT 0,
      matches_won INT DEFAULT 0,
      matches_lost INT DEFAULT 0,
      no_results INT DEFAULT 0,
      points INT DEFAULT 0,
      net_run_rate DECIMAL(4, 2) DEFAULT 0.00,
      PRIMARY KEY (team_id, series_id),
      FOREIGN KEY (team_id) REFERENCES Teams (team_id) ON DELETE CASCADE,
      FOREIGN KEY (series_id) REFERENCES Series (series_id) ON DELETE CASCADE
   );

-- Player Statistics Table  
CREATE TABLE
   PlayerStats (
      player_id INT NOT NULL,
      series_id INT NOT NULL,
      matches_played INT DEFAULT 0,
      runs_scored INT DEFAULT 0,
      balls_faced INT DEFAULT 0,
      fours INT DEFAULT 0,
      sixes INT DEFAULT 0,
      highest_score INT DEFAULT 0,
      fifties INT DEFAULT 0,
      hundreds INT DEFAULT 0,
      overs_bowled DECIMAL(5, 1) DEFAULT 0,
      runs_conceded INT DEFAULT 0,
      wickets_taken INT DEFAULT 0,
      best_bowling VARCHAR(10),
      catches INT DEFAULT 0,
      stumping INT DEFAULT 0,
      PRIMARY KEY (player_id, series_id),
      FOREIGN KEY (player_id) REFERENCES Players (player_id) ON DELETE CASCADE,
      FOREIGN KEY (series_id) REFERENCES Series (series_id) ON DELETE CASCADE
   );

-- Users Table for Authentication
CREATE TABLE
   Users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role ENUM ('admin', 'scorer', 'viewer') DEFAULT 'viewer',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );

-- Add foreign key constraint for team captain
ALTER TABLE Teams ADD CONSTRAINT fk_team_captain FOREIGN KEY (captain_id) REFERENCES Players (player_id) ON DELETE SET NULL;

-- Insert sample data
INSERT INTO
   Teams (
      team_name,
      team_code,
      city,
      founded_year,
      owner,
      coach,
      home_ground,
      team_color
   )
VALUES
   (
      'Mumbai Indians',
      'MI',
      'Mumbai',
      2008,
      'Reliance Industries',
      'Mahela Jayawardene',
      'Wankhede Stadium',
      'Blue'
   ),
   (
      'Chennai Super Kings',
      'CSK',
      'Chennai',
      2008,
      'Chennai Super Kings Cricket Ltd',
      'Stephen Fleming',
      'M. A. Chidambaram Stadium',
      'Yellow'
   ),
   (
      'Royal Challengers Bangalore',
      'RCB',
      'Bangalore',
      2008,
      'United Spirits',
      'Andy Flower',
      'M. Chinnaswamy Stadium',
      'Red'
   ),
   (
      'Kolkata Knight Riders',
      'KKR',
      'Kolkata',
      2008,
      'Red Chillies Entertainment',
      'Brendon McCullum',
      'Eden Gardens',
      'Purple'
   ),
   (
      'Delhi Capitals',
      'DC',
      'Delhi',
      2008,
      'GMR Group & JSW Group',
      'Ricky Ponting',
      'Arun Jaitley Stadium',
      'Blue'
   ),
   (
      'Punjab Kings',
      'PBKS',
      'Mohali',
      2008,
      'Preity Zinta',
      'Anil Kumble',
      'PCA Stadium',
      'Red'
   ),
   (
      'Rajasthan Royals',
      'RR',
      'Jaipur',
      2008,
      'Manoj Badale',
      'Kumar Sangakkara',
      'Sawai Mansingh Stadium',
      'Pink'
   ),
   (
      'Sunrisers Hyderabad',
      'SRH',
      'Hyderabad',
      2013,
      'Kalanithi Maran',
      'Tom Moody',
      'Rajiv Gandhi Intl Stadium',
      'Orange'
   );

INSERT INTO
   Stadiums (
      stadium_name,
      city,
      state,
      capacity,
      established_year
   )
VALUES
   (
      'Wankhede Stadium',
      'Mumbai',
      'Maharashtra',
      33108,
      1974
   ),
   (
      'M. A. Chidambaram Stadium',
      'Chennai',
      'Tamil Nadu',
      50000,
      1916
   ),
   (
      'M. Chinnaswamy Stadium',
      'Bangalore',
      'Karnataka',
      40000,
      1969
   ),
   (
      'Eden Gardens',
      'Kolkata',
      'West Bengal',
      66000,
      1864
   ),
   (
      'Arun Jaitley Stadium',
      'Delhi',
      'Delhi',
      41820,
      1883
   ),
   ('PCA Stadium', 'Mohali', 'Punjab', 26950, 1993),
   (
      'Sawai Mansingh Stadium',
      'Jaipur',
      'Rajasthan',
      30000,
      1969
   ),
   (
      'Rajiv Gandhi International Stadium',
      'Hyderabad',
      'Telangana',
      55000,
      2003
   );

INSERT INTO
   Series (
      series_name,
      season_year,
      start_date,
      end_date,
      total_matches
   )
VALUES
   (
      'Indian Premier League 2024',
      2024,
      '2024-03-22',
      '2024-05-26',
      74
   ),
   (
      'Indian Premier League 2025',
      2025,
      '2025-03-20',
      '2025-05-25',
      74
   );

INSERT INTO
   Umpires (umpire_name, nationality, experience_years)
VALUES
   ('Nitin Menon', 'India', 15),
   ('K N Ananthapadmanabhan', 'India', 20),
   ('Anil Chaudhary', 'India', 18),
   ('Virender Sharma', 'India', 12),
   ('Chris Gaffaney', 'New Zealand', 10);

-- Create sample admin user (password: admin123)
INSERT INTO
   Users (email, password_hash, name, role)
VALUES
   (
      'admin@ipl.com',
      '$2b$10$rOiQ5V8/5gJZo5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5o5J5oe',
      'IPL Admin',
      'admin'
   );

-- Views for easy data access
CREATE VIEW
   MatchResults AS
SELECT
   m.match_id,
   m.match_number,
   m.match_date,
   t1.team_name AS team1_name,
   t1.team_code AS team1_code,
   t2.team_name AS team2_name,
   t2.team_code AS team2_code,
   s.stadium_name,
   s.city,
   tw.team_name AS toss_winner,
   m.toss_decision,
   w.team_name AS winner,
   m.win_type,
   m.win_margin,
   p.player_name AS man_of_match,
   m.is_completed
FROM
   Matches m
   JOIN Teams t1 ON m.team1_id = t1.team_id
   JOIN Teams t2 ON m.team2_id = t2.team_id
   JOIN Stadiums s ON m.stadium_id = s.stadium_id
   LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
   LEFT JOIN Teams w ON m.winner_id = w.team_id
   LEFT JOIN Players p ON m.man_of_match_id = p.player_id;

CREATE VIEW
   PlayerPerformance AS
SELECT
   p.player_id,
   p.player_name,
   t.team_name,
   COUNT(DISTINCT bs.match_id) as matches_played,
   COALESCE(SUM(bs.runs_scored), 0) as total_runs,
   COALESCE(SUM(bs.balls_faced), 0) as total_balls,
   COALESCE(SUM(bs.fours), 0) as total_fours,
   COALESCE(SUM(bs.sixes), 0) as total_sixes,
   COALESCE(MAX(bs.runs_scored), 0) as highest_score,
   CASE
      WHEN SUM(bs.balls_faced) > 0 THEN ROUND(
         (SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)),
         2
      )
      ELSE 0
   END as strike_rate
FROM
   Players p
   LEFT JOIN Teams t ON p.team_id = t.team_id
   LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
WHERE
   p.is_active = TRUE
GROUP BY
   p.player_id,
   p.player_name,
   t.team_name;

CREATE VIEW
   BowlingPerformance AS
SELECT
   p.player_id,
   p.player_name,
   t.team_name,
   COUNT(DISTINCT bow.match_id) as matches_bowled,
   COALESCE(SUM(bow.overs_bowled), 0) as total_overs,
   COALESCE(SUM(bow.runs_conceded), 0) as total_runs_conceded,
   COALESCE(SUM(bow.wickets_taken), 0) as total_wickets,
   CASE
      WHEN SUM(bow.overs_bowled) > 0 THEN ROUND(
         (SUM(bow.runs_conceded) / SUM(bow.overs_bowled)),
         2
      )
      ELSE 0
   END as economy_rate
FROM
   Players p
   LEFT JOIN Teams t ON p.team_id = t.team_id
   LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
WHERE
   p.is_active = TRUE
GROUP BY
   p.player_id,
   p.player_name,
   t.team_name;
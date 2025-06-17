-- IPL Database Management System - Complete Optimized Schema
-- Comprehensive database schema for real IPL operations with all advanced features
-- This file contains all tables, views, and indexes needed for full IPL functionality

CREATE DATABASE IF NOT EXISTS ipl_database;
USE ipl_database;

-- =============================================
-- CORE TABLES
-- =============================================

-- Teams Table
CREATE TABLE Teams (
   team_id INT PRIMARY KEY AUTO_INCREMENT,
   team_name VARCHAR(100) NOT NULL,
   team_code VARCHAR(10) NOT NULL UNIQUE,
   city VARCHAR(50) NOT NULL,
   founded_year INT,
   owner VARCHAR(100),
   coach VARCHAR(100),
   home_ground VARCHAR(100),
   team_color VARCHAR(20),
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Players Table (Base player information)
CREATE TABLE Players (
   player_id INT PRIMARY KEY AUTO_INCREMENT,
   player_name VARCHAR(100) NOT NULL,
   date_of_birth DATE,
   nationality VARCHAR(50),
   role ENUM('Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper') NOT NULL,
   batting_style ENUM('Right-handed', 'Left-handed'),
   bowling_style VARCHAR(50),
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stadiums Table
CREATE TABLE Stadiums (
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
CREATE TABLE Series (
   series_id INT PRIMARY KEY AUTO_INCREMENT,
   series_name VARCHAR(100) NOT NULL,
   season_year INT NOT NULL,
   start_date DATE,
   end_date DATE,
   format ENUM('T20') DEFAULT 'T20',
   authority VARCHAR(50) DEFAULT 'BCCI',
   num_teams INT DEFAULT 10,
   total_matches INT,
   is_completed BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Umpires Table
CREATE TABLE Umpires (
   umpire_id INT PRIMARY KEY AUTO_INCREMENT,
   umpire_name VARCHAR(100) NOT NULL,
   nationality VARCHAR(50),
   experience_years INT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Matches Table (with all IPL-specific features)
CREATE TABLE Matches (
   match_id INT PRIMARY KEY AUTO_INCREMENT,
   series_id INT NOT NULL,
   match_number INT,
   match_type ENUM('league', 'qualifier1', 'qualifier2', 'eliminator', 'final') DEFAULT 'league',
   team1_id INT NOT NULL,
   team2_id INT NOT NULL,
   stadium_id INT NOT NULL,
   match_date DATE NOT NULL,
   match_time TIME,
   
   -- Match status and timing
   match_status ENUM('scheduled', 'live', 'completed', 'abandoned', 'no_result') DEFAULT 'scheduled',
   toss_time TIME NULL,
   start_time TIME NULL,
   end_time TIME NULL,
   
   -- Toss and result
   toss_winner_id INT,
   toss_decision ENUM('bat', 'bowl'),
   winner_id INT,
   win_type ENUM('runs', 'wickets', 'no_result', 'super_over', 'dls') DEFAULT 'runs',
   win_margin INT,
   man_of_match_id INT,
   
   -- Officials
   umpire1_id INT,
   umpire2_id INT,
   third_umpire_id INT,
   
   -- Match conditions
   weather_conditions VARCHAR(100),
   pitch_conditions VARCHAR(100),
   temperature_celsius INT,
   humidity_percent INT,
   wind_speed_kmh INT,
   is_day_night BOOLEAN DEFAULT TRUE,
   has_dew BOOLEAN DEFAULT FALSE,
   
   -- IPL-specific features
   super_over_required BOOLEAN DEFAULT FALSE,
   impact_player_used_team1 BOOLEAN DEFAULT FALSE,
   impact_player_used_team2 BOOLEAN DEFAULT FALSE,
   
   is_completed BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   
   FOREIGN KEY (series_id) REFERENCES Series(series_id) ON DELETE CASCADE,
   FOREIGN KEY (team1_id) REFERENCES Teams(team_id),
   FOREIGN KEY (team2_id) REFERENCES Teams(team_id),
   FOREIGN KEY (stadium_id) REFERENCES Stadiums(stadium_id),
   FOREIGN KEY (toss_winner_id) REFERENCES Teams(team_id),
   FOREIGN KEY (winner_id) REFERENCES Teams(team_id),
   FOREIGN KEY (man_of_match_id) REFERENCES Players(player_id),
   FOREIGN KEY (umpire1_id) REFERENCES Umpires(umpire_id),
   FOREIGN KEY (umpire2_id) REFERENCES Umpires(umpire_id),
   FOREIGN KEY (third_umpire_id) REFERENCES Umpires(umpire_id)
);

-- =============================================
-- PLAYER MANAGEMENT TABLES
-- =============================================

-- Player Contracts Table (Multi-season team assignments)
CREATE TABLE PlayerContracts (
   contract_id INT PRIMARY KEY AUTO_INCREMENT,
   player_id INT NOT NULL,
   team_id INT NOT NULL,
   series_id INT NOT NULL,
   jersey_number INT,
   price_crores DECIMAL(10, 2),
   contract_type ENUM('auction', 'retention', 'replacement', 'trade') DEFAULT 'auction',
   is_captain BOOLEAN DEFAULT FALSE,
   is_vice_captain BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   
   UNIQUE KEY unique_player_season (player_id, series_id),
   FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
   FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE,
   FOREIGN KEY (series_id) REFERENCES Series(series_id) ON DELETE CASCADE
);

-- Player Auction History Table
CREATE TABLE PlayerAuctionHistory (
   auction_id INT PRIMARY KEY AUTO_INCREMENT,
   player_id INT NOT NULL,
   team_id INT,
   series_id INT NOT NULL,
   auction_type ENUM('sold', 'unsold', 'retained', 'released', 'traded') NOT NULL,
   base_price_crores DECIMAL(10, 2),
   sold_price_crores DECIMAL(10, 2),
   auction_date DATE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
   FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE SET NULL,
   FOREIGN KEY (series_id) REFERENCES Series(series_id) ON DELETE CASCADE
);

-- =============================================
-- MATCH SQUAD AND SUBSTITUTION TABLES
-- =============================================

-- Team Squad for each match (15-player squad with Impact Player options)
CREATE TABLE TeamSquads (
   squad_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   team_id INT NOT NULL,
   player_id INT NOT NULL,
   is_playing_xi BOOLEAN DEFAULT FALSE,
   is_impact_player_option BOOLEAN DEFAULT FALSE,
   is_substitute_fielder BOOLEAN DEFAULT FALSE,
   jersey_number INT,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   UNIQUE KEY unique_squad_entry (match_id, team_id, player_id),
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (team_id) REFERENCES Teams(team_id),
   FOREIGN KEY (player_id) REFERENCES Players(player_id)
);

-- Impact Player Substitutions (IPL 2023+ feature)
CREATE TABLE ImpactPlayerSubstitutions (
   substitution_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   team_id INT NOT NULL,
   original_player_id INT NOT NULL,
   impact_player_id INT NOT NULL,
   substitution_over DECIMAL(3,1),
   substitution_innings ENUM('first', 'second') NOT NULL,
   substitution_reason VARCHAR(255),
   impact_player_role ENUM('Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'),
   can_bat BOOLEAN DEFAULT TRUE,
   can_bowl BOOLEAN DEFAULT TRUE,
   can_keep_wicket BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (team_id) REFERENCES Teams(team_id),
   FOREIGN KEY (original_player_id) REFERENCES Players(player_id),
   FOREIGN KEY (impact_player_id) REFERENCES Players(player_id)
);

-- =============================================
-- SCORING TABLES
-- =============================================

-- Batting Scorecard Table
CREATE TABLE BattingScorecard (
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
   out_type ENUM('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket', 'not_out') DEFAULT 'not_out',
   bowler_id INT,
   fielder_id INT,
   strike_rate DECIMAL(5,2) GENERATED ALWAYS AS (
      CASE WHEN balls_faced > 0 THEN (runs_scored * 100.0 / balls_faced) ELSE 0 END
   ) STORED,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (player_id) REFERENCES Players(player_id),
   FOREIGN KEY (team_id) REFERENCES Teams(team_id),
   FOREIGN KEY (bowler_id) REFERENCES Players(player_id),
   FOREIGN KEY (fielder_id) REFERENCES Players(player_id)
);

-- Bowling Scorecard Table
CREATE TABLE BowlingScorecard (
   scorecard_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   player_id INT NOT NULL,
   team_id INT NOT NULL,
   overs_bowled DECIMAL(3,1) DEFAULT 0,
   runs_conceded INT DEFAULT 0,
   wickets_taken INT DEFAULT 0,
   maiden_overs INT DEFAULT 0,
   wides INT DEFAULT 0,
   no_balls INT DEFAULT 0,
   economy_rate DECIMAL(4,2) GENERATED ALWAYS AS (
      CASE WHEN overs_bowled > 0 THEN (runs_conceded / overs_bowled) ELSE 0 END
   ) STORED,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (player_id) REFERENCES Players(player_id),
   FOREIGN KEY (team_id) REFERENCES Teams(team_id)
);

-- Ball-by-Ball Commentary (Optional - for detailed tracking)
CREATE TABLE BallByBall (
   ball_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   innings ENUM('first', 'second') NOT NULL,
   over_number INT NOT NULL,
   ball_number INT NOT NULL,
   batsman_id INT NOT NULL,
   non_striker_id INT NOT NULL,
   bowler_id INT NOT NULL,
   runs_scored INT DEFAULT 0,
   extras INT DEFAULT 0,
   extra_type ENUM('wide', 'no_ball', 'bye', 'leg_bye', 'penalty') NULL,
   is_wicket BOOLEAN DEFAULT FALSE,
   wicket_type ENUM('bowled', 'caught', 'lbw', 'run_out', 'stumped', 'hit_wicket') NULL,
   fielder_id INT NULL,
   ball_type VARCHAR(50),
   shot_played VARCHAR(50),
   is_powerplay BOOLEAN DEFAULT FALSE,
   powerplay_type ENUM('mandatory', 'batting', 'bowling') NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (batsman_id) REFERENCES Players(player_id),
   FOREIGN KEY (non_striker_id) REFERENCES Players(player_id),
   FOREIGN KEY (bowler_id) REFERENCES Players(player_id),
   FOREIGN KEY (fielder_id) REFERENCES Players(player_id)
);

-- =============================================
-- ADVANCED IPL FEATURES
-- =============================================

-- Super Over Details (for tied matches)
CREATE TABLE SuperOvers (
   super_over_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   super_over_number INT DEFAULT 1,
   batting_first_team_id INT NOT NULL,
   bowling_first_team_id INT NOT NULL,
   team1_runs INT DEFAULT 0,
   team1_wickets INT DEFAULT 0,
   team2_runs INT DEFAULT 0,
   team2_wickets INT DEFAULT 0,
   winner_team_id INT,
   win_reason ENUM('runs', 'wickets', 'boundary_count') DEFAULT 'runs',
   team1_boundaries INT DEFAULT 0,
   team2_boundaries INT DEFAULT 0,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (batting_first_team_id) REFERENCES Teams(team_id),
   FOREIGN KEY (bowling_first_team_id) REFERENCES Teams(team_id),
   FOREIGN KEY (winner_team_id) REFERENCES Teams(team_id)
);

-- Powerplay Details
CREATE TABLE PowerplayDetails (
   powerplay_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   team_id INT NOT NULL,
   innings ENUM('first', 'second') NOT NULL,
   mandatory_powerplay_runs INT DEFAULT 0,
   mandatory_powerplay_wickets INT DEFAULT 0,
   batting_powerplay_runs INT DEFAULT 0,
   batting_powerplay_wickets INT DEFAULT 0,
   batting_powerplay_overs VARCHAR(10),
   bowling_powerplay_runs INT DEFAULT 0,
   bowling_powerplay_wickets INT DEFAULT 0,
   bowling_powerplay_overs VARCHAR(10),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (team_id) REFERENCES Teams(team_id)
);

-- DLS Method Applications
CREATE TABLE DLSApplications (
   dls_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   interruption_over DECIMAL(3,1),
   interruption_ball INT,
   interruption_reason ENUM('rain', 'bad_light', 'wet_outfield', 'other') DEFAULT 'rain',
   interruption_duration_minutes INT,
   original_target INT,
   revised_target INT,
   revised_overs DECIMAL(3,1),
   team1_resources_available DECIMAL(5,2),
   team2_resources_available DECIMAL(5,2),
   par_score INT,
   match_result ENUM('team1_win', 'team2_win', 'no_result') DEFAULT 'no_result',
   win_margin_dls VARCHAR(50),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE
);

-- Match Interruptions
CREATE TABLE MatchInterruptions (
   interruption_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   start_time TIMESTAMP NOT NULL,
   end_time TIMESTAMP NULL,
   duration_minutes INT NULL,
   innings ENUM('first', 'second', 'super_over') NOT NULL,
   over_number DECIMAL(3,1),
   reason ENUM('rain', 'bad_light', 'wet_outfield', 'crowd_disturbance', 'technical', 'medical', 'other') NOT NULL,
   description TEXT,
   overs_lost DECIMAL(3,1) DEFAULT 0,
   requires_dls BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE
);

-- Strategic Timeouts
CREATE TABLE StrategyTimeouts (
   timeout_id INT PRIMARY KEY AUTO_INCREMENT,
   match_id INT NOT NULL,
   team_id INT NOT NULL,
   innings ENUM('first', 'second') NOT NULL,
   over_taken DECIMAL(3,1) NOT NULL,
   duration_seconds INT DEFAULT 150,
   timeout_type ENUM('strategic', 'drinks', 'medical', 'technical') DEFAULT 'strategic',
   called_by VARCHAR(100),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
   FOREIGN KEY (match_id) REFERENCES Matches(match_id) ON DELETE CASCADE,
   FOREIGN KEY (team_id) REFERENCES Teams(team_id)
);

-- =============================================
-- STATISTICS TABLES
-- =============================================

-- Team Statistics Table
CREATE TABLE TeamStats (
   team_id INT NOT NULL,
   series_id INT NOT NULL,
   matches_played INT DEFAULT 0,
   matches_won INT DEFAULT 0,
   matches_lost INT DEFAULT 0,
   no_results INT DEFAULT 0,
   points INT DEFAULT 0,
   net_run_rate DECIMAL(4,2) DEFAULT 0.00,
   
   PRIMARY KEY (team_id, series_id),
   FOREIGN KEY (team_id) REFERENCES Teams(team_id) ON DELETE CASCADE,
   FOREIGN KEY (series_id) REFERENCES Series(series_id) ON DELETE CASCADE
);

-- Player Statistics Table
CREATE TABLE PlayerStats (
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
   overs_bowled DECIMAL(5,1) DEFAULT 0,
   runs_conceded INT DEFAULT 0,
   wickets_taken INT DEFAULT 0,
   best_bowling VARCHAR(10),
   catches INT DEFAULT 0,
   stumping INT DEFAULT 0,
   
   PRIMARY KEY (player_id, series_id),
   FOREIGN KEY (player_id) REFERENCES Players(player_id) ON DELETE CASCADE,
   FOREIGN KEY (series_id) REFERENCES Series(series_id) ON DELETE CASCADE
);

-- =============================================
-- USER MANAGEMENT TABLE
-- =============================================

-- Users Table for Authentication
CREATE TABLE Users (
   user_id INT PRIMARY KEY AUTO_INCREMENT,
   email VARCHAR(255) UNIQUE NOT NULL,
   password_hash VARCHAR(255) NOT NULL,
   name VARCHAR(100) NOT NULL,
   role ENUM('admin', 'scorer', 'viewer') DEFAULT 'viewer',
   is_active BOOLEAN DEFAULT TRUE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- OPTIMIZED VIEWS
-- =============================================

-- Enhanced Match Results View (with all IPL features)
CREATE VIEW EnhancedMatchResults AS
SELECT 
   m.match_id,
   m.match_number,
   m.match_date,
   m.match_time,
   m.match_type,
   m.match_status,
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
   
   -- Advanced IPL features
   CASE WHEN so.super_over_id IS NOT NULL THEN TRUE ELSE FALSE END AS had_super_over,
   CASE WHEN dls.dls_id IS NOT NULL THEN TRUE ELSE FALSE END AS dls_applied,
   m.impact_player_used_team1,
   m.impact_player_used_team2,
   
   m.weather_conditions,
   m.pitch_conditions,
   m.is_day_night,
   m.has_dew,
   m.is_completed
FROM Matches m
JOIN Teams t1 ON m.team1_id = t1.team_id
JOIN Teams t2 ON m.team2_id = t2.team_id
JOIN Stadiums s ON m.stadium_id = s.stadium_id
LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
LEFT JOIN Teams w ON m.winner_id = w.team_id
LEFT JOIN Players p ON m.man_of_match_id = p.player_id
LEFT JOIN SuperOvers so ON m.match_id = so.match_id
LEFT JOIN DLSApplications dls ON m.match_id = dls.match_id;

-- Player Performance View (Multi-season)
CREATE VIEW PlayerPerformance AS
SELECT 
   p.player_id,
   p.player_name,
   pc.team_id,
   t.team_name,
   se.series_name,
   se.season_year,
   COUNT(DISTINCT bs.match_id) as matches_played,
   COALESCE(SUM(bs.runs_scored), 0) as total_runs,
   COALESCE(SUM(bs.balls_faced), 0) as total_balls,
   COALESCE(SUM(bs.fours), 0) as total_fours,
   COALESCE(SUM(bs.sixes), 0) as total_sixes,
   COALESCE(MAX(bs.runs_scored), 0) as highest_score,
   CASE 
      WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)), 2)
      ELSE 0 
   END as strike_rate
FROM Players p
LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
LEFT JOIN Teams t ON pc.team_id = t.team_id
LEFT JOIN Series se ON pc.series_id = se.series_id
LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
LEFT JOIN Matches m ON bs.match_id = m.match_id AND m.series_id = pc.series_id
WHERE p.is_active = TRUE
GROUP BY p.player_id, p.player_name, pc.team_id, t.team_name, se.series_name, se.season_year;

-- Bowling Performance View
CREATE VIEW BowlingPerformance AS
SELECT 
   p.player_id,
   p.player_name,
   pc.team_id,
   t.team_name,
   se.series_name,
   se.season_year,
   COUNT(DISTINCT bow.match_id) as matches_bowled,
   COALESCE(SUM(bow.overs_bowled), 0) as total_overs,
   COALESCE(SUM(bow.runs_conceded), 0) as total_runs_conceded,
   COALESCE(SUM(bow.wickets_taken), 0) as total_wickets,
   CASE 
      WHEN SUM(bow.overs_bowled) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.overs_bowled)), 2)
      ELSE 0 
   END as economy_rate
FROM Players p
LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
LEFT JOIN Teams t ON pc.team_id = t.team_id
LEFT JOIN Series se ON pc.series_id = se.series_id
LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
LEFT JOIN Matches m ON bow.match_id = m.match_id AND m.series_id = pc.series_id
WHERE p.is_active = TRUE
GROUP BY p.player_id, p.player_name, pc.team_id, t.team_name, se.series_name, se.season_year;

-- Team Captains View
CREATE VIEW TeamCaptains AS
SELECT 
   pc.team_id,
   t.team_name,
   pc.series_id,
   se.series_name,
   se.season_year,
   p.player_id,
   p.player_name,
   pc.is_captain,
   pc.is_vice_captain
FROM PlayerContracts pc
JOIN Teams t ON pc.team_id = t.team_id
JOIN Series se ON pc.series_id = se.series_id
JOIN Players p ON pc.player_id = p.player_id
WHERE pc.is_captain = TRUE OR pc.is_vice_captain = TRUE;

-- Player Career View
CREATE VIEW PlayerCareer AS
SELECT 
   p.player_id,
   p.player_name,
   p.nationality,
   p.role,
   COUNT(DISTINCT pc.series_id) as seasons_played,
   COUNT(DISTINCT pc.team_id) as teams_played_for,
   GROUP_CONCAT(DISTINCT CONCAT(t.team_code, ' (', se.season_year, ')') ORDER BY se.season_year SEPARATOR ', ') as team_history,
   SUM(pc.price_crores) as total_earnings_crores
FROM Players p
LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
LEFT JOIN Teams t ON pc.team_id = t.team_id
LEFT JOIN Series se ON pc.series_id = se.series_id
WHERE p.is_active = TRUE
GROUP BY p.player_id, p.player_name, p.nationality, p.role;

-- Impact Player Usage Statistics
CREATE VIEW ImpactPlayerStats AS
SELECT 
   se.season_year,
   t.team_name,
   COUNT(DISTINCT ips.match_id) as matches_used_impact_player,
   COUNT(DISTINCT m.match_id) as total_matches,
   ROUND((COUNT(DISTINCT ips.match_id) * 100.0 / COUNT(DISTINCT m.match_id)), 2) as usage_percentage
FROM Series se
JOIN Matches m ON se.series_id = m.series_id
JOIN Teams t ON (t.team_id = m.team1_id OR t.team_id = m.team2_id)
LEFT JOIN ImpactPlayerSubstitutions ips ON m.match_id = ips.match_id AND ips.team_id = t.team_id
WHERE m.is_completed = TRUE
GROUP BY se.season_year, t.team_id, t.team_name;

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Core indexes for fast queries
CREATE INDEX idx_matches_series_date ON Matches(series_id, match_date);
CREATE INDEX idx_matches_teams ON Matches(team1_id, team2_id);
CREATE INDEX idx_matches_status ON Matches(match_status, is_completed);

CREATE INDEX idx_player_contracts_season ON PlayerContracts(series_id, team_id);
CREATE INDEX idx_player_contracts_player ON PlayerContracts(player_id, series_id);

CREATE INDEX idx_batting_scorecard_match_player ON BattingScorecard(match_id, player_id);
CREATE INDEX idx_batting_scorecard_team ON BattingScorecard(team_id, match_id);

CREATE INDEX idx_bowling_scorecard_match_player ON BowlingScorecard(match_id, player_id);
CREATE INDEX idx_bowling_scorecard_team ON BowlingScorecard(team_id, match_id);

-- Advanced feature indexes
CREATE INDEX idx_ball_by_ball_match_over ON BallByBall(match_id, over_number, ball_number);
CREATE INDEX idx_impact_player_match_team ON ImpactPlayerSubstitutions(match_id, team_id);
CREATE INDEX idx_powerplay_match_team ON PowerplayDetails(match_id, team_id, innings);
CREATE INDEX idx_team_squad_match_playing ON TeamSquads(match_id, team_id, is_playing_xi);

-- Statistical indexes
CREATE INDEX idx_team_stats_series ON TeamStats(series_id, points DESC);
CREATE INDEX idx_player_stats_series ON PlayerStats(series_id, runs_scored DESC);

-- User management indexes
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role_active ON Users(role, is_active);

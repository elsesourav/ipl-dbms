-- Insert Super Over Data
-- Examples of Super Over scenarios

INSERT INTO SuperOvers (match_id, super_over_number, batting_first_team_id, bowling_first_team_id, team1_runs, team1_wickets, team2_runs, team2_wickets, winner_team_id, win_reason, team1_boundaries, team2_boundaries) VALUES
-- Hypothetical Super Over in a KKR vs MI match (2024)
(5, 1, 1, 2, 12, 1, 15, 0, 2, 'runs', 2, 3), -- MI wins super over

-- Another Super Over example - CSK vs RCB (2023)
(6, 1, 3, 4, 8, 2, 8, 1, 3, 'wickets', 1, 1); -- CSK wins on fewer wickets lost

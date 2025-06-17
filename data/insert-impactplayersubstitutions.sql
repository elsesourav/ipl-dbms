-- Insert Impact Player Substitutions Data
-- Examples of Impact Player usage in 2024 season

INSERT INTO ImpactPlayerSubstitutions (match_id, team_id, original_player_id, impact_player_id, substitution_over, substitution_innings, substitution_reason, impact_player_role, can_bat, can_bowl, can_keep_wicket) VALUES
-- Match 7: KKR vs CSK (2024) - KKR uses Impact Player
(7, 1, 13, 14, 8.3, 'first', 'Strategic substitution for batting depth', 'All-rounder', TRUE, TRUE, FALSE), -- Harshit Rana out, Anukul Roy in

-- Match 8: MI vs RCB (2024) - RCB uses Impact Player
(8, 4, 58, 57, 6.0, 'second', 'Need batting power for chase', 'Wicket-keeper', TRUE, FALSE, TRUE), -- Karn Sharma out, Anuj Rawat in

-- Match 9: RCB vs KKR (2024) - KKR uses Impact Player
(9, 1, 15, 12, 10.2, 'second', 'Death overs batting specialist', 'All-rounder', TRUE, TRUE, FALSE), -- Vaibhav Arora out, Ramandeep Singh in

-- Match 10: CSK vs MI (2024) - CSK uses Impact Player
(10, 3, 44, 42, 7.5, 'first', 'Experience for middle overs', 'Batsman', TRUE, FALSE, FALSE), -- Mitchell Santner out, Ajinkya Rahane in

-- Match 11: KKR vs RCB (2024) - Both teams use Impact Player
(11, 1, 14, 13, 9.0, 'second', 'Pace bowling for death overs', 'Bowler', FALSE, TRUE, FALSE), -- Anukul Roy out, Harshit Rana in
(11, 4, 59, 60, 12.0, 'second', 'Left-arm pace variation', 'Bowler', FALSE, TRUE, FALSE); -- Suyash Prabhudessai out, Reece Topley in

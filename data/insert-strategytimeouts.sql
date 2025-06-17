-- Insert Strategy Timeouts Data
-- Strategic timeouts taken during matches

INSERT INTO StrategyTimeouts (match_id, team_id, innings, over_taken, duration_seconds, timeout_type, called_by) VALUES
-- Match 1: KKR vs RCB (2023)
(1, 1, 'first', 6.0, 150, 'strategic', 'Shreyas Iyer (Captain)'),
(1, 1, 'first', 15.0, 150, 'strategic', 'Brendon McCullum (Coach)'),
(1, 4, 'second', 8.0, 150, 'strategic', 'Faf du Plessis (Captain)'),
(1, 4, 'second', 16.0, 150, 'strategic', 'Andy Flower (Coach)'),

-- Match 2: MI vs CSK (2023)
(2, 3, 'first', 7.0, 150, 'strategic', 'Ruturaj Gaikwad (Captain)'),
(2, 3, 'first', 14.0, 150, 'strategic', 'Stephen Fleming (Coach)'),
(2, 2, 'second', 9.0, 150, 'strategic', 'Rohit Sharma (Captain)'),
(2, 2, 'second', 17.0, 150, 'strategic', 'Mark Boucher (Coach)'),

-- Match 7: KKR vs CSK (2024)
(7, 1, 'first', 8.0, 150, 'strategic', 'Shreyas Iyer (Captain)'),
(7, 1, 'first', 16.0, 150, 'strategic', 'Chandrakant Pandit (Coach)'),
(7, 3, 'second', 6.0, 150, 'strategic', 'Ruturaj Gaikwad (Captain)'),
(7, 3, 'second', 12.0, 150, 'strategic', 'Stephen Fleming (Coach)'),

-- Drinks Break examples
(1, 1, 'first', 10.0, 180, 'drinks', 'Umpire'),
(1, 4, 'second', 10.0, 180, 'drinks', 'Umpire'),
(2, 3, 'first', 10.0, 180, 'drinks', 'Umpire'),
(2, 2, 'second', 10.0, 180, 'drinks', 'Umpire');

-- Insert Match Interruptions Data
-- Weather and other interruptions during matches

INSERT INTO MatchInterruptions (match_id, start_time, end_time, duration_minutes, innings, over_number, reason, description, overs_lost, requires_dls) VALUES
-- Rain interruption during MI vs CSK (2023)
(2, '2023-04-02 17:45:00', '2023-04-02 18:30:00', 45, 'second', 12.3, 'rain', 'Heavy rain stopped play during MI chase', 3.0, TRUE),

-- Bad light interruption during RCB vs KKR (2024)
(9, '2024-03-24 21:15:00', '2024-03-24 21:35:00', 20, 'second', 15.2, 'bad_light', 'Poor light conditions, floodlights insufficient', 1.0, FALSE),

-- Crowd disturbance during KKR vs CSK (2024)
(7, '2024-03-22 20:30:00', '2024-03-22 20:45:00', 15, 'first', 8.1, 'crowd_disturbance', 'Crowd unrest after controversial decision', 0.0, FALSE),

-- Technical issue during Final 2024
(16, '2024-05-26 20:45:00', '2024-05-26 21:00:00', 15, 'second', 6.4, 'technical', 'Spidercam malfunction caused delay', 0.0, FALSE);

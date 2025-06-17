-- Insert Team Squads Data
-- Match-wise squad selections for sample matches
-- Match 1: KKR vs RCB (2023) - Squad for KKR
INSERT INTO
   TeamSquads (
      match_id,
      team_id,
      player_id,
      is_playing_xi,
      is_impact_player_option,
      jersey_number
   )
VALUES
   -- KKR Playing XI (Match 1, 2023)
   (1, 1, 1, TRUE, FALSE, 41), -- Shreyas Iyer
   (1, 1, 2, TRUE, FALSE, 12), -- Andre Russell
   (1, 1, 3, TRUE, FALSE, 74), -- Sunil Narine
   (1, 1, 4, TRUE, FALSE, 27), -- Nitish Rana
   (1, 1, 5, TRUE, FALSE, 29), -- Rinku Singh
   (1, 1, 6, TRUE, FALSE, 20), -- Umesh Yadav
   (1, 1, 7, TRUE, FALSE, 37), -- Varun Chakaravarthy
   (1, 1, 8, TRUE, FALSE, 32), -- Venkatesh Iyer
   (1, 1, 9, TRUE, FALSE, 28), -- Rahmanullah Gurbaz
   (1, 1, 12, TRUE, FALSE, 25), -- Ramandeep Singh
   (1, 1, 13, TRUE, FALSE, 19), -- Harshit Rana
   -- Impact Player Options
   (1, 1, 14, FALSE, TRUE, 21), -- Anukul Roy
   (1, 1, 15, FALSE, TRUE, 18), -- Vaibhav Arora
   -- Match 1: KKR vs RCB (2023) - Squad for RCB
   (1, 4, 46, TRUE, FALSE, 18), -- Virat Kohli
   (1, 4, 47, TRUE, FALSE, 19), -- Faf du Plessis
   (1, 4, 48, TRUE, FALSE, 32), -- Glenn Maxwell
   (1, 4, 49, TRUE, FALSE, 1), -- Dinesh Karthik
   (1, 4, 50, TRUE, FALSE, 9), -- Rajat Patidar
   (1, 4, 51, TRUE, FALSE, 73), -- Mohammed Siraj
   (1, 4, 52, TRUE, FALSE, 8), -- Josh Hazlewood
   (1, 4, 53, TRUE, FALSE, 28), -- Wanindu Hasaranga
   (1, 4, 54, TRUE, FALSE, 17), -- Harshal Patel
   (1, 4, 55, TRUE, FALSE, 25), -- Shahbaz Ahmed
   (1, 4, 56, TRUE, FALSE, 42), -- Mahipal Lomror
   -- Impact Player Options
   (1, 4, 57, FALSE, TRUE, 17), -- Anuj Rawat
   (1, 4, 58, FALSE, TRUE, 31), -- Karn Sharma
   -- Match 2: MI vs CSK (2023) - Squad for MI
   (2, 2, 16, TRUE, FALSE, 45), -- Rohit Sharma
   (2, 2, 17, TRUE, FALSE, 23), -- Ishan Kishan
   (2, 2, 18, TRUE, FALSE, 63), -- Suryakumar Yadav
   (2, 2, 19, TRUE, FALSE, 9), -- Tilak Varma
   (2, 2, 20, TRUE, FALSE, 1), -- Tim David
   (2, 2, 21, TRUE, FALSE, 55), -- Kieron Pollard
   (2, 2, 22, TRUE, FALSE, 93), -- Jasprit Bumrah
   (2, 2, 23, TRUE, FALSE, 18), -- Trent Boult
   (2, 2, 25, TRUE, FALSE, 24), -- Krunal Pandya
   (2, 2, 26, TRUE, FALSE, 33), -- Hardik Pandya
   (2, 2, 27, TRUE, FALSE, 30), -- Cameron Green
   -- Impact Player Options
   (2, 2, 28, FALSE, TRUE, 19), -- Arjun Tendulkar
   (2, 2, 29, FALSE, TRUE, 29), -- Dewald Brevis
   -- Match 2: MI vs CSK (2023) - Squad for CSK
   (2, 3, 31, TRUE, FALSE, 7), -- MS Dhoni
   (2, 3, 32, TRUE, FALSE, 31), -- Ruturaj Gaikwad
   (2, 3, 33, TRUE, FALSE, 88), -- Devon Conway
   (2, 3, 34, TRUE, FALSE, 25), -- Shivam Dube
   (2, 3, 35, TRUE, FALSE, 8), -- Ravindra Jadeja
   (2, 3, 36, TRUE, FALSE, 18), -- Moeen Ali
   (2, 3, 37, TRUE, FALSE, 90), -- Deepak Chahar
   (2, 3, 38, TRUE, FALSE, 13), -- Tushar Deshpande
   (2, 3, 39, TRUE, FALSE, 20), -- Mustafizur Rahman
   (2, 3, 40, TRUE, FALSE, 91), -- Matheesha Pathirana
   (2, 3, 43, TRUE, FALSE, 27), -- Shardul Thakur
   -- Impact Player Options
   (2, 3, 42, FALSE, TRUE, 27), -- Ajinkya Rahane (as backup)
   -- Match 7: KKR vs CSK (2024) - Squad for KKR
   (7, 1, 1, TRUE, FALSE, 41), -- Shreyas Iyer
   (7, 1, 2, TRUE, FALSE, 12), -- Andre Russell
   (7, 1, 3, TRUE, FALSE, 74), -- Sunil Narine
   (7, 1, 4, TRUE, FALSE, 27), -- Nitish Rana
   (7, 1, 5, TRUE, FALSE, 29), -- Rinku Singh
   (7, 1, 7, TRUE, FALSE, 37), -- Varun Chakaravarthy
   (7, 1, 8, TRUE, FALSE, 32), -- Venkatesh Iyer
   (7, 1, 10, TRUE, FALSE, 99), -- Mitchell Starc
   (7, 1, 11, TRUE, FALSE, 38), -- Phil Salt
   (7, 1, 12, TRUE, FALSE, 25), -- Ramandeep Singh
   (7, 1, 13, TRUE, FALSE, 19), -- Harshit Rana
   -- Impact Player Options
   (7, 1, 14, FALSE, TRUE, 21), -- Anukul Roy
   (7, 1, 15, FALSE, TRUE, 18), -- Vaibhav Arora
   -- Match 7: KKR vs CSK (2024) - Squad for CSK
   (7, 3, 31, TRUE, FALSE, 7), -- MS Dhoni
   (7, 3, 32, TRUE, FALSE, 31), -- Ruturaj Gaikwad
   (7, 3, 33, TRUE, FALSE, 88), -- Devon Conway
   (7, 3, 34, TRUE, FALSE, 25), -- Shivam Dube
   (7, 3, 35, TRUE, FALSE, 8), -- Ravindra Jadeja
   (7, 3, 36, TRUE, FALSE, 18), -- Moeen Ali
   (7, 3, 37, TRUE, FALSE, 90), -- Deepak Chahar
   (7, 3, 38, TRUE, FALSE, 13), -- Tushar Deshpande
   (7, 3, 40, TRUE, FALSE, 91), -- Matheesha Pathirana
   (7, 3, 41, TRUE, FALSE, 11), -- Rachin Ravindra
   (7, 3, 45, TRUE, FALSE, 15), -- Daryl Mitchell
   -- Impact Player Options
   (7, 3, 42, FALSE, TRUE, 27), -- Ajinkya Rahane
   (7, 3, 44, FALSE, TRUE, 6);

-- Mitchell Santner
-- Insert Player Contracts Data
-- Player-Team assignments for 2023 and 2024 seasons
-- KKR Contracts 2023
INSERT INTO
   PlayerContracts (
      player_id,
      team_id,
      series_id,
      jersey_number,
      price_crores,
      contract_type,
      is_captain,
      is_vice_captain
   )
VALUES
   -- KKR 2023 Squad
   (1, 1, 1, 41, 12.25, 'auction', TRUE, FALSE), -- Shreyas Iyer (Captain)
   (2, 1, 1, 12, 12.00, 'retention', FALSE, FALSE), -- Andre Russell
   (3, 1, 1, 74, 8.00, 'retention', FALSE, FALSE), -- Sunil Narine
   (4, 1, 1, 27, 8.00, 'auction', FALSE, TRUE), -- Nitish Rana (Vice Captain)
   (5, 1, 1, 29, 0.55, 'auction', FALSE, FALSE), -- Rinku Singh
   (6, 1, 1, 20, 2.00, 'auction', FALSE, FALSE), -- Umesh Yadav
   (7, 1, 1, 37, 8.00, 'retention', FALSE, FALSE), -- Varun Chakaravarthy
   (8, 1, 1, 32, 8.00, 'auction', FALSE, FALSE), -- Venkatesh Iyer
   (9, 1, 1, 28, 0.50, 'auction', FALSE, FALSE), -- Rahmanullah Gurbaz
   (12, 1, 1, 25, 0.20, 'auction', FALSE, FALSE), -- Ramandeep Singh
   (13, 1, 1, 19, 0.20, 'auction', FALSE, FALSE), -- Harshit Rana
   (14, 1, 1, 21, 0.20, 'auction', FALSE, FALSE), -- Anukul Roy
   (15, 1, 1, 18, 0.60, 'auction', FALSE, FALSE), -- Vaibhav Arora
   -- KKR 2024 Squad
   (1, 1, 2, 41, 12.25, 'retention', TRUE, FALSE), -- Shreyas Iyer (Captain)
   (2, 1, 2, 12, 12.00, 'retention', FALSE, FALSE), -- Andre Russell
   (3, 1, 2, 74, 8.00, 'retention', FALSE, FALSE), -- Sunil Narine
   (5, 1, 2, 29, 0.55, 'retention', FALSE, FALSE), -- Rinku Singh
   (10, 1, 2, 99, 24.75, 'auction', FALSE, FALSE), -- Mitchell Starc
   (11, 1, 2, 38, 11.50, 'auction', FALSE, FALSE), -- Phil Salt
   (7, 1, 2, 37, 8.00, 'retention', FALSE, FALSE), -- Varun Chakaravarthy
   (8, 1, 2, 32, 8.00, 'retention', FALSE, FALSE), -- Venkatesh Iyer
   (12, 1, 2, 25, 0.20, 'retention', FALSE, FALSE), -- Ramandeep Singh
   (13, 1, 2, 19, 0.20, 'retention', FALSE, FALSE), -- Harshit Rana
   (14, 1, 2, 21, 0.20, 'retention', FALSE, FALSE), -- Anukul Roy
   (15, 1, 2, 18, 0.60, 'retention', FALSE, FALSE), -- Vaibhav Arora
   (4, 1, 2, 27, 8.00, 'retention', FALSE, TRUE), -- Nitish Rana (Vice Captain)
   -- Mumbai Indians 2023 Squad
   (16, 2, 1, 45, 16.00, 'retention', TRUE, FALSE), -- Rohit Sharma (Captain)
   (17, 2, 1, 23, 15.25, 'retention', FALSE, FALSE), -- Ishan Kishan
   (18, 2, 1, 63, 8.00, 'retention', FALSE, FALSE), -- Suryakumar Yadav
   (19, 2, 1, 9, 1.70, 'auction', FALSE, FALSE), -- Tilak Varma
   (20, 2, 1, 1, 8.50, 'auction', FALSE, FALSE), -- Tim David
   (21, 2, 1, 55, 5.40, 'auction', FALSE, FALSE), -- Kieron Pollard
   (22, 2, 1, 93, 12.00, 'retention', FALSE, FALSE), -- Jasprit Bumrah
   (23, 2, 1, 18, 8.00, 'auction', FALSE, FALSE), -- Trent Boult
   (25, 2, 1, 24, 7.00, 'auction', FALSE, FALSE), -- Krunal Pandya
   (26, 2, 1, 33, 15.00, 'retention', FALSE, TRUE), -- Hardik Pandya (Vice Captain)
   (27, 2, 1, 30, 17.50, 'auction', FALSE, FALSE), -- Cameron Green
   (28, 2, 1, 19, 0.20, 'auction', FALSE, FALSE), -- Arjun Tendulkar
   (29, 2, 1, 29, 3.00, 'auction', FALSE, FALSE), -- Dewald Brevis
   -- Mumbai Indians 2024 Squad
   (26, 2, 2, 33, 15.00, 'retention', TRUE, FALSE), -- Hardik Pandya (Captain)
   (16, 2, 2, 45, 16.00, 'retention', FALSE, FALSE), -- Rohit Sharma
   (17, 2, 2, 23, 15.25, 'retention', FALSE, FALSE), -- Ishan Kishan
   (18, 2, 2, 63, 8.00, 'retention', FALSE, TRUE), -- Suryakumar Yadav (Vice Captain)
   (19, 2, 2, 9, 1.70, 'retention', FALSE, FALSE), -- Tilak Varma
   (20, 2, 2, 1, 8.50, 'retention', FALSE, FALSE), -- Tim David
   (22, 2, 2, 93, 12.00, 'retention', FALSE, FALSE), -- Jasprit Bumrah
   (24, 2, 2, 13, 12.25, 'auction', FALSE, FALSE), -- Mohammed Siraj
   (27, 2, 2, 30, 17.50, 'retention', FALSE, FALSE), -- Cameron Green
   (30, 2, 2, 55, 2.40, 'auction', FALSE, FALSE), -- Romario Shepherd
   (28, 2, 2, 19, 0.20, 'retention', FALSE, FALSE), -- Arjun Tendulkar
   (29, 2, 2, 29, 3.00, 'retention', FALSE, FALSE), -- Dewald Brevis
   -- Chennai Super Kings 2023 Squad
   (31, 3, 1, 7, 12.00, 'retention', FALSE, FALSE), -- MS Dhoni
   (32, 3, 1, 31, 6.00, 'retention', TRUE, FALSE), -- Ruturaj Gaikwad (Captain)
   (33, 3, 1, 88, 1.00, 'auction', FALSE, FALSE), -- Devon Conway
   (34, 3, 1, 25, 5.00, 'auction', FALSE, FALSE), -- Shivam Dube
   (35, 3, 1, 8, 16.00, 'retention', FALSE, TRUE), -- Ravindra Jadeja (Vice Captain)
   (36, 3, 1, 18, 8.00, 'auction', FALSE, FALSE), -- Moeen Ali
   (37, 3, 1, 90, 14.00, 'retention', FALSE, FALSE), -- Deepak Chahar
   (38, 3, 1, 13, 0.20, 'auction', FALSE, FALSE), -- Tushar Deshpande
   (39, 3, 1, 20, 2.00, 'auction', FALSE, FALSE), -- Mustafizur Rahman
   (40, 3, 1, 91, 0.20, 'auction', FALSE, FALSE), -- Matheesha Pathirana
   (43, 3, 1, 27, 5.75, 'auction', FALSE, FALSE), -- Shardul Thakur
   -- Chennai Super Kings 2024 Squad
   (31, 3, 2, 7, 12.00, 'retention', FALSE, FALSE), -- MS Dhoni
   (32, 3, 2, 31, 6.00, 'retention', TRUE, FALSE), -- Ruturaj Gaikwad (Captain)
   (33, 3, 2, 88, 1.00, 'retention', FALSE, FALSE), -- Devon Conway
   (34, 3, 2, 25, 5.00, 'retention', FALSE, FALSE), -- Shivam Dube
   (35, 3, 2, 8, 16.00, 'retention', FALSE, TRUE), -- Ravindra Jadeja (Vice Captain)
   (36, 3, 2, 18, 8.00, 'retention', FALSE, FALSE), -- Moeen Ali
   (37, 3, 2, 90, 14.00, 'retention', FALSE, FALSE), -- Deepak Chahar
   (38, 3, 2, 13, 0.20, 'retention', FALSE, FALSE), -- Tushar Deshpande
   (40, 3, 2, 91, 0.20, 'retention', FALSE, FALSE), -- Matheesha Pathirana
   (41, 3, 2, 11, 1.80, 'auction', FALSE, FALSE), -- Rachin Ravindra
   (42, 3, 2, 27, 1.50, 'auction', FALSE, FALSE), -- Ajinkya Rahane
   (44, 3, 2, 6, 2.60, 'auction', FALSE, FALSE), -- Mitchell Santner
   (45, 3, 2, 15, 14.00, 'auction', FALSE, FALSE), -- Daryl Mitchell
   -- Royal Challengers Bangalore 2023 Squad
   (46, 4, 1, 18, 15.00, 'retention', FALSE, FALSE), -- Virat Kohli
   (47, 4, 1, 19, 7.00, 'auction', TRUE, FALSE), -- Faf du Plessis (Captain)
   (48, 4, 1, 32, 11.00, 'auction', FALSE, FALSE), -- Glenn Maxwell
   (49, 4, 1, 1, 5.50, 'auction', FALSE, FALSE), -- Dinesh Karthik
   (50, 4, 1, 9, 0.20, 'auction', FALSE, FALSE), -- Rajat Patidar
   (51, 4, 1, 73, 7.00, 'retention', FALSE, FALSE), -- Mohammed Siraj
   (52, 4, 1, 8, 7.75, 'auction', FALSE, FALSE), -- Josh Hazlewood
   (53, 4, 1, 28, 10.75, 'auction', FALSE, FALSE), -- Wanindu Hasaranga
   (54, 4, 1, 17, 10.75, 'auction', FALSE, FALSE), -- Harshal Patel
   (55, 4, 1, 25, 2.40, 'auction', FALSE, FALSE), -- Shahbaz Ahmed
   (56, 4, 1, 42, 0.65, 'auction', FALSE, FALSE), -- Mahipal Lomror
   -- Royal Challengers Bangalore 2024 Squad
   (46, 4, 2, 18, 15.00, 'retention', FALSE, TRUE), -- Virat Kohli (Vice Captain)
   (47, 4, 2, 19, 7.00, 'retention', TRUE, FALSE), -- Faf du Plessis (Captain)
   (48, 4, 2, 32, 11.00, 'retention', FALSE, FALSE), -- Glenn Maxwell
   (49, 4, 2, 1, 5.50, 'retention', FALSE, FALSE), -- Dinesh Karthik
   (50, 4, 2, 9, 0.20, 'retention', FALSE, FALSE), -- Rajat Patidar
   (52, 4, 2, 8, 12.50, 'auction', FALSE, FALSE), -- Josh Hazlewood
   (55, 4, 2, 25, 2.40, 'retention', FALSE, FALSE), -- Shahbaz Ahmed
   (56, 4, 2, 42, 0.65, 'retention', FALSE, FALSE), -- Mahipal Lomror
   (57, 4, 2, 17, 0.50, 'auction', FALSE, FALSE), -- Anuj Rawat
   (58, 4, 2, 31, 0.50, 'auction', FALSE, FALSE), -- Karn Sharma
   (59, 4, 2, 54, 0.30, 'auction', FALSE, FALSE), -- Suyash Prabhudessai
   (60, 4, 2, 26, 3.40, 'auction', FALSE, FALSE);

-- Reece Topley
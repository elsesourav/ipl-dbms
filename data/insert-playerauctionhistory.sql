-- Insert Player Auction History Data
-- Auction records for 2023 and 2024 IPL seasons

-- 2023 Auction Data
INSERT INTO PlayerAuctionHistory (player_id, team_id, series_id, auction_type, base_price_crores, sold_price_crores, auction_date) VALUES
-- KKR 2023 Purchases
(1, 1, 1, 'sold', 2.00, 12.25, '2022-12-23'), -- Shreyas Iyer
(4, 1, 1, 'sold', 1.00, 8.00, '2022-12-23'), -- Nitish Rana
(5, 1, 1, 'sold', 0.20, 0.55, '2022-12-23'), -- Rinku Singh
(6, 1, 1, 'sold', 1.00, 2.00, '2022-12-23'), -- Umesh Yadav
(8, 1, 1, 'sold', 2.00, 8.00, '2022-12-23'), -- Venkatesh Iyer

-- Mumbai Indians 2023 Purchases
(19, 2, 1, 'sold', 0.20, 1.70, '2022-12-23'), -- Tilak Varma
(20, 2, 1, 'sold', 1.50, 8.50, '2022-12-23'), -- Tim David
(21, 2, 1, 'sold', 2.00, 5.40, '2022-12-23'), -- Kieron Pollard
(23, 2, 1, 'sold', 2.00, 8.00, '2022-12-23'), -- Trent Boult
(25, 2, 1, 'sold', 2.00, 7.00, '2022-12-23'), -- Krunal Pandya
(27, 2, 1, 'sold', 2.00, 17.50, '2022-12-23'), -- Cameron Green

-- Chennai Super Kings 2023 Purchases
(33, 3, 1, 'sold', 1.00, 1.00, '2022-12-23'), -- Devon Conway
(34, 3, 1, 'sold', 2.00, 5.00, '2022-12-23'), -- Shivam Dube
(36, 3, 1, 'sold', 2.00, 8.00, '2022-12-23'), -- Moeen Ali
(39, 3, 1, 'sold', 1.00, 2.00, '2022-12-23'), -- Mustafizur Rahman
(43, 3, 1, 'sold', 2.00, 5.75, '2022-12-23'), -- Shardul Thakur

-- Royal Challengers Bangalore 2023 Purchases
(47, 4, 1, 'sold', 2.00, 7.00, '2022-12-23'), -- Faf du Plessis
(48, 4, 1, 'sold', 2.00, 11.00, '2022-12-23'), -- Glenn Maxwell
(49, 4, 1, 'sold', 1.50, 5.50, '2022-12-23'), -- Dinesh Karthik
(52, 4, 1, 'sold', 2.00, 7.75, '2022-12-23'), -- Josh Hazlewood
(53, 4, 1, 'sold', 1.50, 10.75, '2022-12-23'), -- Wanindu Hasaranga
(54, 4, 1, 'sold', 2.00, 10.75, '2022-12-23'), -- Harshal Patel

-- 2024 Auction Data
INSERT INTO PlayerAuctionHistory (player_id, team_id, series_id, auction_type, base_price_crores, sold_price_crores, auction_date) VALUES
-- KKR 2024 Major Purchase
(10, 1, 2, 'sold', 2.00, 24.75, '2023-12-19'), -- Mitchell Starc (Record Purchase)
(11, 1, 2, 'sold', 2.00, 11.50, '2023-12-19'), -- Phil Salt

-- Mumbai Indians 2024 Purchases
(24, 2, 2, 'sold', 2.00, 12.25, '2023-12-19'), -- Mohammed Siraj
(30, 2, 2, 'sold', 0.50, 2.40, '2023-12-19'), -- Romario Shepherd

-- Chennai Super Kings 2024 Purchases
(41, 3, 2, 'sold', 0.20, 1.80, '2023-12-19'), -- Rachin Ravindra
(42, 3, 2, 'sold', 0.50, 1.50, '2023-12-19'), -- Ajinkya Rahane
(44, 3, 2, 'sold', 1.00, 2.60, '2023-12-19'), -- Mitchell Santner
(45, 3, 2, 'sold', 2.00, 14.00, '2023-12-19'), -- Daryl Mitchell

-- Royal Challengers Bangalore 2024 Purchases
(52, 4, 2, 'sold', 2.00, 12.50, '2023-12-19'), -- Josh Hazlewood
(60, 4, 2, 'sold', 1.00, 3.40, '2023-12-19'), -- Reece Topley

-- Some unsold players examples
INSERT INTO PlayerAuctionHistory (player_id, team_id, series_id, auction_type, base_price_crores, sold_price_crores, auction_date) VALUES
(51, NULL, 2, 'unsold', 1.00, NULL, '2023-12-19'), -- Mohammed Siraj (before going to MI)
(53, NULL, 2, 'unsold', 1.50, NULL, '2023-12-19'), -- Wanindu Hasaranga
(54, NULL, 2, 'unsold', 2.00, NULL, '2023-12-19'); -- Harshal Patel

-- Insert DLS Applications Data
-- DLS method applications due to rain interruptions
INSERT INTO
   DLSApplications (
      match_id,
      interruption_over,
      interruption_ball,
      interruption_reason,
      interruption_duration_minutes,
      original_target,
      revised_target,
      revised_overs,
      team1_resources_available,
      team2_resources_available,
      par_score,
      match_result,
      win_margin_dls
   )
VALUES
   -- DLS applied in MI vs CSK (2023) due to rain
   (
      2,
      12.3,
      2,
      'rain',
      45,
      202,
      178,
      17.0,
      100.00,
      85.50,
      165,
      'team2_win',
      'CSK won by 8 runs (DLS method)'
   ),
   -- DLS applied in a hypothetical RCB vs KKR match
   (
      3,
      14.2,
      4,
      'rain',
      60,
      185,
      156,
      15.0,
      100.00,
      80.25,
      142,
      'team1_win',
      'KKR won by 12 runs (DLS method)'
   );
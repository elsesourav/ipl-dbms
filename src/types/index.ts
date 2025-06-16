export interface Team {
   team_id: number;
   team_name: string;
   team_code: string;
   city: string;
   founded_year?: number;
   owner?: string;
   captain_id?: number;
   coach?: string;
   home_ground?: string;
   team_color?: string;
   created_at: Date;
   updated_at: Date;
}

export interface Player {
   player_id: number;
   player_name: string;
   date_of_birth?: Date;
   nationality?: string;
   role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper";
   batting_style?: "Right-handed" | "Left-handed";
   bowling_style?: string;
   jersey_number?: number;
   price_crores?: number;
   team_id?: number;
   is_active: boolean;
   created_at: Date;
   updated_at: Date;
}

export interface Stadium {
   stadium_id: number;
   stadium_name: string;
   city: string;
   state?: string;
   country: string;
   capacity?: number;
   established_year?: number;
   created_at: Date;
}

export interface Series {
   series_id: number;
   series_name: string;
   season_year: number;
   start_date?: Date;
   end_date?: Date;
   format: "T20";
   authority: string;
   num_teams: number;
   total_matches?: number;
   is_completed: boolean;
   created_at: Date;
}

export interface Match {
   match_id: number;
   series_id: number;
   match_number?: number;
   match_type: "league" | "qualifier1" | "qualifier2" | "eliminator" | "final";
   team1_id: number;
   team2_id: number;
   stadium_id: number;
   match_date: Date;
   match_time?: string;
   toss_winner_id?: number;
   toss_decision?: "bat" | "bowl";
   winner_id?: number;
   win_type?: "runs" | "wickets" | "no_result";
   win_margin?: number;
   man_of_match_id?: number;
   umpire1_id?: number;
   umpire2_id?: number;
   third_umpire_id?: number;
   is_completed: boolean;
   created_at: Date;
   updated_at: Date;
}

export interface BattingScorecard {
   scorecard_id: number;
   match_id: number;
   player_id: number;
   team_id: number;
   batting_position?: number;
   runs_scored: number;
   balls_faced: number;
   fours: number;
   sixes: number;
   is_out: boolean;
   out_type:
      | "bowled"
      | "caught"
      | "lbw"
      | "run_out"
      | "stumped"
      | "hit_wicket"
      | "not_out";
   bowler_id?: number;
   fielder_id?: number;
   strike_rate: number;
   created_at: Date;
}

export interface BowlingScorecard {
   scorecard_id: number;
   match_id: number;
   player_id: number;
   team_id: number;
   overs_bowled: number;
   runs_conceded: number;
   wickets_taken: number;
   maiden_overs: number;
   wides: number;
   no_balls: number;
   economy_rate: number;
   created_at: Date;
}

export interface User {
   user_id: number;
   email: string;
   password_hash: string;
   name: string;
   role: "admin" | "scorer" | "viewer";
   is_active: boolean;
   created_at: Date;
   updated_at: Date;
}

export interface MatchResult {
   match_id: number;
   match_number?: number;
   match_date: Date;
   team1_name: string;
   team1_code: string;
   team2_name: string;
   team2_code: string;
   stadium_name: string;
   city: string;
   toss_winner?: string;
   toss_decision?: "bat" | "bowl";
   winner?: string;
   win_type?: "runs" | "wickets" | "no_result";
   win_margin?: number;
   man_of_match?: string;
   is_completed: boolean;
}

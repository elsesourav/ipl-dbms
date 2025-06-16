// Statistics Types
export interface BasicStats {
   total_teams: number;
   total_players: number;
   total_matches: number;
   total_series: number;
}

export interface PlayerBattingStats {
   player_id: number;
   player_name: string;
   team_name?: string;
   team_code?: string;
   role: string;
   matches_played: number;
   total_runs: number;
   total_balls: number;
   total_fours: number;
   total_sixes: number;
   highest_score: number;
   strike_rate: number;
   fifties: number;
   hundreds: number;
}

export interface PlayerBowlingStats {
   player_id: number;
   player_name: string;
   team_name?: string;
   team_code?: string;
   role: string;
   matches_bowled: number;
   total_overs: number;
   total_runs_conceded: number;
   total_wickets: number;
   maiden_overs: number;
   economy_rate: number;
   average: number;
}

export interface TeamPerformance {
   team_id: number;
   team_name: string;
   team_code: string;
   city: string;
   team_color: string;
   matches_played: number;
   matches_won: number;
   matches_lost: number;
   no_results: number;
   win_percentage: number;
   points: number;
}

export interface TeamStandings {
   team_id: number;
   team_name: string;
   team_code: string;
   matches_played: number;
   won: number;
   lost: number;
   no_result: number;
   points: number;
   win_percentage: number;
   net_run_rate: number;
}

export interface MatchDetails {
   match_id: number;
   match_number?: number;
   match_date: string;
   match_time?: string;
   match_type: string;
   is_completed: boolean;
   series_name: string;
   season_year: number;
   team1_name: string;
   team1_code: string;
   team1_color: string;
   team2_name: string;
   team2_code: string;
   team2_color: string;
   winner_name?: string;
   winner_code?: string;
   toss_winner_name?: string;
   toss_decision?: string;
   win_type?: string;
   win_margin?: number;
   stadium_name: string;
   city: string;
   state: string;
   man_of_match?: string;
   umpire1?: string;
   umpire2?: string;
}

export interface MatchSummary {
   total_matches: number;
   completed_matches: number;
   upcoming_matches: number;
   finals: number;
   qualifiers: number;
   eliminators: number;
   league_matches: number;
}

export interface VenueStats {
   stadium_name: string;
   city: string;
   state: string;
   matches_hosted: number;
   completed_matches: number;
}

export interface HeadToHead {
   team1: string;
   team2: string;
   total_matches: number;
   team1_wins: number;
   team2_wins: number;
   draws: number;
}

export interface StatisticsData {
   overview: BasicStats;
   topScorers: PlayerBattingStats[];
   topBowlers: PlayerBowlingStats[];
   teamPerformance: TeamPerformance[];
   recentMatches: MatchDetails[];
}

// API Response Types
export interface APIResponse<T> {
   success: boolean;
   data?: T;
   error?: string;
}

export interface PlayerStatsResponse {
   batting?: PlayerBattingStats[];
   bowling?: PlayerBowlingStats[];
}

export interface MatchStatsResponse {
   summary?: MatchSummary;
   venueStats?: VenueStats[];
}

export interface TeamStatsResponse {
   headToHead?: HeadToHead[];
}

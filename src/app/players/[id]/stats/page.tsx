"use client";

import {
   ArrowLeft,
   BarChart,
   Target,
   TrendingUp,
   Trophy,
   Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface PlayerStats {
   matches_played: number;
   runs_scored: number;
   balls_faced: number;
   fours: number;
   sixes: number;
   highest_score: number;
   fifties: number;
   hundreds: number;
   strike_rate: number;
   overs_bowled: number;
   runs_conceded: number;
   wickets_taken: number;
   maiden_overs: number;
   economy_rate: number;
   best_bowling: string | null;
   catches: number;
   stumping: number;
}

interface Player {
   player_id: number;
   player_name: string;
   team_name: string;
   role: string;
   nationality: string;
   batting_style: string;
   bowling_style: string;
}

export default function PlayerStatsPage() {
   const params = useParams();
   const playerId = params.id as string;

   const [player, setPlayer] = useState<Player | null>(null);
   const [stats, setStats] = useState<PlayerStats | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);

            // Fetch player info
            const playerResponse = await fetch(`/api/players/${playerId}`);
            if (!playerResponse.ok) {
               throw new Error("Failed to fetch player data");
            }
            const playerData = await playerResponse.json();
            setPlayer({
               player_id: playerData.player_id,
               player_name: playerData.player_name,
               team_name: playerData.team_name,
               role: playerData.role,
               nationality: playerData.nationality,
               batting_style: playerData.batting_style,
               bowling_style: playerData.bowling_style,
            });

            // Fetch player stats
            const statsResponse = await fetch(`/api/players/${playerId}/stats`);
            if (!statsResponse.ok) {
               throw new Error("Failed to fetch stats data");
            }
            const statsData = await statsResponse.json();

            if (statsData.success && statsData.data) {
               setStats(statsData.data);
            } else if (statsData.matches_played !== undefined) {
               setStats(statsData);
            } else {
               throw new Error("Invalid stats data format");
            }
         } catch (err) {
            console.error("Error fetching data:", err);
            setError(err instanceof Error ? err.message : "An error occurred");
         } finally {
            setLoading(false);
         }
      };

      if (playerId) {
         fetchData();
      }
   }, [playerId]);

   const safeToFixed = (value: any, decimals: number = 2): string => {
      if (value === null || value === undefined) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num) ? "0.00" : num.toFixed(decimals);
   };

   const calculateAverage = (runs: number, dismissals: number): string => {
      if (dismissals === 0) return runs > 0 ? "∞" : "0.00";
      return (runs / dismissals).toFixed(2);
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
               <div className="flex items-center justify-center min-h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               </div>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
               <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">
                     Error
                  </h1>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Link
                     href="/players"
                     className="text-blue-600 hover:underline"
                  >
                     ← Back to Players
                  </Link>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
               <Link
                  href={`/players/${playerId}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
               >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Player Profile
               </Link>

               {player && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <h1 className="text-3xl font-bold text-gray-900 mb-2">
                              {player.player_name}
                           </h1>
                           <div className="space-y-1 text-gray-600">
                              <p className="text-lg">
                                 {player.team_name} • {player.role}
                              </p>
                              <p>
                                 {player.nationality} • {player.batting_style}
                              </p>
                              {player.bowling_style && (
                                 <p>Bowling: {player.bowling_style}</p>
                              )}
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-sm text-gray-500">
                              Career Statistics
                           </div>
                           <div className="text-2xl font-bold text-blue-600">
                              {stats?.matches_played || 0} Matches
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Statistics */}
            {stats ? (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Batting Statistics */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                     <div className="flex items-center mb-6">
                        <Target className="h-6 w-6 text-orange-500 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">
                           Batting Statistics
                        </h2>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-orange-600">
                              {stats.runs_scored}
                           </div>
                           <div className="text-sm text-gray-600">
                              Total Runs
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-green-600">
                              {stats.highest_score}
                           </div>
                           <div className="text-sm text-gray-600">
                              Highest Score
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-blue-600">
                              {safeToFixed(stats.strike_rate)}
                           </div>
                           <div className="text-sm text-gray-600">
                              Strike Rate
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-purple-600">
                              {calculateAverage(
                                 stats.runs_scored,
                                 stats.matches_played -
                                    (stats.hundreds + stats.fifties)
                              )}
                           </div>
                           <div className="text-sm text-gray-600">Average</div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-indigo-600">
                              {stats.balls_faced}
                           </div>
                           <div className="text-sm text-gray-600">
                              Balls Faced
                           </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-red-600">
                              {stats.fours}/{stats.sixes}
                           </div>
                           <div className="text-sm text-gray-600">
                              Fours/Sixes
                           </div>
                        </div>
                     </div>

                     {/* Milestones */}
                     <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                           Milestones
                        </h3>
                        <div className="flex space-x-4">
                           <div className="bg-yellow-50 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-yellow-600">
                                 {stats.hundreds}
                              </div>
                              <div className="text-xs text-gray-600">
                                 Hundreds
                              </div>
                           </div>
                           <div className="bg-green-50 rounded-lg p-3 text-center">
                              <div className="text-xl font-bold text-green-600">
                                 {stats.fifties}
                              </div>
                              <div className="text-xs text-gray-600">
                                 Fifties
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Bowling Statistics */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                     <div className="flex items-center mb-6">
                        <TrendingUp className="h-6 w-6 text-blue-500 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">
                           Bowling Statistics
                        </h2>
                     </div>

                     {stats.overs_bowled > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-purple-600">
                                 {stats.wickets_taken}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Wickets
                              </div>
                           </div>

                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-blue-600">
                                 {safeToFixed(stats.economy_rate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Economy Rate
                              </div>
                           </div>

                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-indigo-600">
                                 {stats.overs_bowled}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Overs Bowled
                              </div>
                           </div>

                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-red-600">
                                 {stats.runs_conceded}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Runs Conceded
                              </div>
                           </div>

                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-green-600">
                                 {stats.maiden_overs}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Maiden Overs
                              </div>
                           </div>

                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-orange-600">
                                 {stats.best_bowling || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                 Best Bowling
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="text-center py-8">
                           <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                           <p className="text-gray-500">
                              No bowling statistics available
                           </p>
                        </div>
                     )}
                  </div>

                  {/* Fielding Statistics */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                     <div className="flex items-center mb-6">
                        <Users className="h-6 w-6 text-green-500 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">
                           Fielding Statistics
                        </h2>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-green-600">
                              {stats.catches}
                           </div>
                           <div className="text-sm text-gray-600">Catches</div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                           <div className="text-2xl font-bold text-blue-600">
                              {stats.stumping}
                           </div>
                           <div className="text-sm text-gray-600">
                              Stumpings
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Overall Performance Summary */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                     <div className="flex items-center mb-6">
                        <BarChart className="h-6 w-6 text-purple-500 mr-3" />
                        <h2 className="text-2xl font-bold text-gray-900">
                           Performance Summary
                        </h2>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="font-medium text-gray-700">
                              Matches Played
                           </span>
                           <span className="text-xl font-bold text-blue-600">
                              {stats.matches_played}
                           </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="font-medium text-gray-700">
                              Runs per Match
                           </span>
                           <span className="text-xl font-bold text-green-600">
                              {stats.matches_played > 0
                                 ? (
                                      stats.runs_scored / stats.matches_played
                                   ).toFixed(1)
                                 : "0.0"}
                           </span>
                        </div>

                        {stats.overs_bowled > 0 && (
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-700">
                                 Wickets per Match
                              </span>
                              <span className="text-xl font-bold text-purple-600">
                                 {stats.matches_played > 0
                                    ? (
                                         stats.wickets_taken /
                                         stats.matches_played
                                      ).toFixed(1)
                                    : "0.0"}
                              </span>
                           </div>
                        )}

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                           <span className="font-medium text-gray-700">
                              Total Contributions
                           </span>
                           <span className="text-xl font-bold text-indigo-600">
                              {stats.catches +
                                 stats.stumping +
                                 stats.wickets_taken}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                     No Statistics Available
                  </h2>
                  <p className="text-gray-500">
                     This player hasn't played in any completed matches yet.
                  </p>
               </div>
            )}

            {/* Navigation Links */}
            <div className="mt-8 flex justify-center space-x-4">
               <Link
                  href={`/players/${playerId}/performances`}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
               >
                  View Match Performances
               </Link>
               <Link
                  href={`/players/${playerId}`}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
               >
                  Back to Profile
               </Link>
            </div>
         </div>
      </div>
   );
}

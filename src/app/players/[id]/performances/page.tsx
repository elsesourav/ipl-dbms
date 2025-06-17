"use client";

import { ArrowLeft, Calendar, Target, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Performance {
   match_id: number;
   match_date: string;
   opponent_team: string;
   venue: string;
   runs_scored: number;
   balls_faced: number;
   fours: number;
   sixes: number;
   strike_rate: number | string;
   is_out: boolean;
   out_type: string | null;
   overs_bowled: number;
   runs_conceded: number;
   wickets_taken: number;
   economy_rate: number | string;
}

interface Player {
   player_id: number;
   player_name: string;
   team_name: string;
   role: string;
}

export default function PlayerPerformancesPage() {
   const params = useParams();
   const playerId = params.id as string;

   const [player, setPlayer] = useState<Player | null>(null);
   const [performances, setPerformances] = useState<Performance[]>([]);
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
            });

            // Fetch performances
            const performancesResponse = await fetch(
               `/api/players/${playerId}/performances`
            );
            if (!performancesResponse.ok) {
               throw new Error("Failed to fetch performances data");
            }
            const performancesData = await performancesResponse.json();
            setPerformances(performancesData.data || []);
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

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
         year: "numeric",
         month: "short",
         day: "numeric",
      });
   };

   const safeToFixed = (value: any, decimals: number = 2): string => {
      if (value === null || value === undefined) return "0.00";
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num) ? "0.00" : num.toFixed(decimals);
   };

   const getBattingClass = (runs: number) => {
      if (runs >= 50) return "text-green-600 font-bold";
      if (runs >= 30) return "text-blue-600 font-semibold";
      if (runs >= 10) return "text-gray-700";
      return "text-gray-500";
   };

   const getBowlingClass = (wickets: number) => {
      if (wickets >= 3) return "text-purple-600 font-bold";
      if (wickets >= 2) return "text-blue-600 font-semibold";
      if (wickets >= 1) return "text-gray-700";
      return "text-gray-500";
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
                           <p className="text-lg text-gray-600">
                              {player.team_name} • {player.role}
                           </p>
                        </div>
                        <div className="text-right">
                           <div className="text-sm text-gray-500">
                              Match Performances
                           </div>
                           <div className="text-2xl font-bold text-blue-600">
                              {performances.length} Matches
                           </div>
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Performances */}
            {performances.length === 0 ? (
               <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                     No Performances Found
                  </h2>
                  <p className="text-gray-500">
                     This player hasn't played in any completed matches yet.
                  </p>
               </div>
            ) : (
               <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                     Match Performances
                  </h2>

                  {performances.map((performance, index) => (
                     <div
                        key={index}
                        className="bg-white rounded-lg shadow-lg p-6"
                     >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                           <div className="mb-4 lg:mb-0">
                              <div className="flex items-center text-gray-600 mb-2">
                                 <Calendar className="h-4 w-4 mr-2" />
                                 {formatDate(performance.match_date)}
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                 vs {performance.opponent_team}
                              </h3>
                              <p className="text-gray-600">
                                 {performance.venue}
                              </p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* Batting Performance */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                 <Target className="h-5 w-5 text-orange-500 mr-2" />
                                 <h4 className="font-semibold text-gray-900">
                                    Batting
                                 </h4>
                              </div>

                              {performance.balls_faced > 0 ? (
                                 <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Runs:
                                       </span>
                                       <span
                                          className={`text-lg font-bold ${getBattingClass(
                                             performance.runs_scored
                                          )}`}
                                       >
                                          {performance.runs_scored}
                                          {!performance.is_out && "*"}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Balls:
                                       </span>
                                       <span className="font-semibold">
                                          {performance.balls_faced}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          4s/6s:
                                       </span>
                                       <span className="font-semibold">
                                          {performance.fours}/
                                          {performance.sixes}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Strike Rate:
                                       </span>
                                       <span className="font-semibold">
                                          {safeToFixed(performance.strike_rate)}
                                       </span>
                                    </div>
                                    {performance.is_out &&
                                       performance.out_type && (
                                          <div className="flex justify-between items-center">
                                             <span className="text-gray-600">
                                                Dismissal:
                                             </span>
                                             <span className="text-red-600 capitalize">
                                                {performance.out_type.replace(
                                                   "_",
                                                   " "
                                                )}
                                             </span>
                                          </div>
                                       )}
                                 </div>
                              ) : (
                                 <p className="text-gray-500 italic">
                                    Did not bat
                                 </p>
                              )}
                           </div>

                           {/* Bowling Performance */}
                           <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                 <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                                 <h4 className="font-semibold text-gray-900">
                                    Bowling
                                 </h4>
                              </div>

                              {performance.overs_bowled > 0 ? (
                                 <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Wickets:
                                       </span>
                                       <span
                                          className={`text-lg font-bold ${getBowlingClass(
                                             performance.wickets_taken
                                          )}`}
                                       >
                                          {performance.wickets_taken}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Overs:
                                       </span>
                                       <span className="font-semibold">
                                          {performance.overs_bowled}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Runs:
                                       </span>
                                       <span className="font-semibold">
                                          {performance.runs_conceded}
                                       </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                       <span className="text-gray-600">
                                          Economy:
                                       </span>
                                       <span className="font-semibold">
                                          {safeToFixed(
                                             performance.economy_rate
                                          )}
                                       </span>
                                    </div>
                                 </div>
                              ) : (
                                 <p className="text-gray-500 italic">
                                    Did not bowl
                                 </p>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}

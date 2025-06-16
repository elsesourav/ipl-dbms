"use client";

// Force dynamic rendering for API calls
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatisticsData } from "@/types/statistics";
import {
   Award,
   BarChart3,
   Target,
   TrendingUp,
   Trophy,
   Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function StatisticsPage() {
   const [statistics, setStatistics] = useState<StatisticsData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      fetchStatistics();
   }, []);

   const fetchStatistics = async () => {
      try {
         setLoading(true);
         const response = await fetch("/api/statistics");
         const result = await response.json();
         console.log(result);

         if (result.success) {
            setStatistics(result.data);
         } else {
            setError(result.error || "Failed to fetch statistics");
         }
      } catch (err) {
         console.error("Error fetching statistics:", err);
         setError("An error occurred while fetching statistics");
      } finally {
         setLoading(false);
      }
   };

   const topBatsmen = statistics?.topScorers?.slice(0, 10) || [];
   const topBowlers = statistics?.topBowlers?.slice(0, 10) || [];

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p>Loading statistics...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 mb-4">{error}</p>
               <Button onClick={fetchStatistics}>Try Again</Button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                     IPL Statistics
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                     Player performance, records, and detailed analytics
                  </p>
               </div>
               <div className="flex gap-4">
                  <Link href="/">
                     <Button variant="outline">← Back to Home</Button>
                  </Link>
                  <Link href="/auth/signin">
                     <Button>Admin Login</Button>
                  </Link>
               </div>
            </div>

            {/* Quick Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Runs
                     </CardTitle>
                     <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {statistics?.topScorers?.reduce(
                           (sum, player) => sum + player.total_runs,
                           0
                        ) || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Across all matches
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Wickets
                     </CardTitle>
                     <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {statistics?.topBowlers?.reduce(
                           (sum, player) => sum + player.total_wickets,
                           0
                        ) || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Taken by bowlers
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Sixes Hit
                     </CardTitle>
                     <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {statistics?.topScorers?.reduce(
                           (sum, player) => sum + player.total_sixes,
                           0
                        ) || 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Maximum boundaries
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Avg Strike Rate
                     </CardTitle>
                     <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {statistics?.topScorers &&
                        statistics.topScorers.length > 0
                           ? (
                                statistics.topScorers.reduce(
                                   (sum, player) => sum + player.strike_rate,
                                   0
                                ) / statistics.topScorers.length
                             ).toFixed(1)
                           : "0"}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Overall tournament
                     </p>
                  </CardContent>
               </Card>
            </div>

            {/* Detailed Statistics */}
            <Tabs defaultValue="batting" className="space-y-4">
               <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="batting">Batting</TabsTrigger>
                  <TabsTrigger value="bowling">Bowling</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="matches">Matches</TabsTrigger>
               </TabsList>

               <TabsContent value="batting" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Trophy className="w-5 h-5" />
                           Top Run Scorers
                        </CardTitle>
                        <CardDescription>
                           Leading batsmen in the tournament
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {topBatsmen.map((player, index) => (
                              <div
                                 key={player.player_id}
                                 className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                                       {index + 1}
                                    </div>
                                    <div>
                                       <div className="font-medium">
                                          {player.player_name}
                                       </div>
                                       <div className="text-sm text-gray-500">
                                          {player.team_name}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="font-bold text-lg">
                                       {player.total_runs}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                       SR: {player.strike_rate.toFixed(1)} | HS:{" "}
                                       {player.highest_score}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="bowling" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Award className="w-5 h-5" />
                           Top Wicket Takers
                        </CardTitle>
                        <CardDescription>
                           Leading bowlers in the tournament
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {topBowlers.map((player, index) => (
                              <div
                                 key={player.player_id}
                                 className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                 <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                                       {index + 1}
                                    </div>
                                    <div>
                                       <div className="font-medium">
                                          {player.player_name}
                                       </div>
                                       <div className="text-sm text-gray-500">
                                          {player.team_name}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <div className="font-bold text-lg">
                                       {player.total_wickets}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                       Eco: {player.economy_rate.toFixed(2)} |
                                       Overs: {player.total_overs}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="teams" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Trophy className="w-5 h-5" />
                           Team Performance
                        </CardTitle>
                        <CardDescription>
                           Win-loss records and performance metrics
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {statistics?.teamPerformance
                              ?.slice(0, 8)
                              .map((team, index) => (
                                 <div
                                    key={team.team_id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                 >
                                    <div className="flex items-center gap-3">
                                       <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                                          {index + 1}
                                       </div>
                                       <div>
                                          <div className="font-medium">
                                             {team.team_name}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                             {team.team_code} • {team.city}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="font-bold text-lg">
                                          {team.win_percentage}%
                                       </div>
                                       <div className="text-xs text-gray-500">
                                          {team.matches_won}W-
                                          {team.matches_lost}L | {team.points}{" "}
                                          pts
                                       </div>
                                    </div>
                                 </div>
                              )) || (
                              <div className="text-center py-8 text-gray-500">
                                 No team performance data available
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="matches" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Target className="w-5 h-5" />
                           Recent Matches
                        </CardTitle>
                        <CardDescription>
                           Latest match results and outcomes
                        </CardDescription>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-4">
                           {statistics?.recentMatches
                              ?.slice(0, 10)
                              .map((match) => (
                                 <div
                                    key={match.match_id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                 >
                                    <div>
                                       <div className="font-medium">
                                          {match.team1_name} vs{" "}
                                          {match.team2_name}
                                       </div>
                                       <div className="text-sm text-gray-500">
                                          {match.stadium_name}, {match.city}
                                       </div>
                                       <div className="text-xs text-gray-400">
                                          {new Date(
                                             match.match_date
                                          ).toLocaleDateString()}
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       {match.is_completed ? (
                                          <>
                                             <div className="font-bold text-green-600">
                                                {match.winner_name ||
                                                   "No Result"}
                                             </div>
                                             <div className="text-xs text-gray-500">
                                                {match.series_name}
                                             </div>
                                          </>
                                       ) : (
                                          <div className="font-bold text-yellow-600">
                                             Upcoming
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              )) || (
                              <div className="text-center py-8 text-gray-500">
                                 No recent matches data available
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>

            {(!statistics?.topScorers || statistics.topScorers.length === 0) &&
               (!statistics?.topBowlers ||
                  statistics.topBowlers.length === 0) &&
               !loading && (
                  <div className="text-center py-12">
                     <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No statistics available
                     </h3>
                     <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Play some matches to see player statistics and
                        performance data.
                     </p>
                     <Button onClick={fetchStatistics}>Refresh</Button>
                  </div>
               )}

            {/* Quick Actions */}
            {statistics && (
               <Card>
                  <CardHeader>
                     <CardTitle>Quick Actions</CardTitle>
                     <CardDescription>
                        Access detailed statistics and analytics
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button asChild variant="outline" className="h-20">
                           <Link href="/players">
                              <div className="text-center">
                                 <Award className="h-6 w-6 mx-auto mb-2" />
                                 <div>Player Stats</div>
                              </div>
                           </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20">
                           <Link href="/teams">
                              <div className="text-center">
                                 <Trophy className="h-6 w-6 mx-auto mb-2" />
                                 <div>Team Performance</div>
                              </div>
                           </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-20">
                           <Link href="/matches">
                              <div className="text-center">
                                 <Target className="h-6 w-6 mx-auto mb-2" />
                                 <div>Match Results</div>
                              </div>
                           </Link>
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            )}
         </div>
      </div>
   );
}

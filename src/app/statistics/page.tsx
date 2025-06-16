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

interface PlayerStats {
   player_id: number;
   player_name: string;
   team_name?: string;
   matches_played: number;
   total_runs: number;
   total_balls: number;
   total_fours: number;
   total_sixes: number;
   highest_score: number;
   strike_rate: number;
}

interface BowlingStats {
   player_id: number;
   player_name: string;
   team_name?: string;
   matches_bowled: number;
   total_overs: number;
   total_runs_conceded: number;
   total_wickets: number;
   economy_rate: number;
}

export default function StatisticsPage() {
   const [battingStats, setBattingStats] = useState<PlayerStats[]>([]);
   const [bowlingStats, setBowlingStats] = useState<BowlingStats[]>([]);
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

         if (result.success) {
            // Map the API response to our component state
            const mappedBattingStats = result.data.topScorers.map(
               (player: any) => ({
                  player_id: player.player_id || Math.random(),
                  player_name: player.name,
                  team_name: player.team,
                  matches_played: player.matches_played || 0,
                  total_runs: player.total_runs || 0,
                  total_balls: 0, // Not available from current query
                  total_fours: 0, // Not available from current query
                  total_sixes: 0, // Not available from current query
                  highest_score: 0, // Not available from current query
                  strike_rate: 0, // Not available from current query
               })
            );

            const mappedBowlingStats = result.data.topBowlers.map(
               (player: any) => ({
                  player_id: player.player_id || Math.random(),
                  player_name: player.name,
                  team_name: player.team,
                  matches_bowled: player.matches_bowled || 0,
                  total_overs: 0, // Not available from current query
                  total_runs_conceded: 0, // Not available from current query
                  total_wickets: player.total_wickets || 0,
                  economy_rate: 0, // Not available from current query
               })
            );

            setBattingStats(mappedBattingStats);
            setBowlingStats(mappedBowlingStats);
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

   const topBatsmen = [...battingStats]
      .sort((a, b) => b.total_runs - a.total_runs)
      .slice(0, 10);

   const topBowlers = [...bowlingStats]
      .sort((a, b) => b.total_wickets - a.total_wickets)
      .slice(0, 10);

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
                        {battingStats.reduce(
                           (sum, player) => sum + player.total_runs,
                           0
                        )}
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
                        {bowlingStats.reduce(
                           (sum, player) => sum + player.total_wickets,
                           0
                        )}
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
                        {battingStats.reduce(
                           (sum, player) => sum + player.total_sixes,
                           0
                        )}
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
                        {battingStats.length > 0
                           ? (
                                battingStats.reduce(
                                   (sum, player) => sum + player.strike_rate,
                                   0
                                ) / battingStats.length
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
               <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="batting">Batting Statistics</TabsTrigger>
                  <TabsTrigger value="bowling">Bowling Statistics</TabsTrigger>
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
            </Tabs>

            {battingStats.length === 0 &&
               bowlingStats.length === 0 &&
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
         </div>
      </div>
   );
}

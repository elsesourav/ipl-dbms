"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
   ArrowLeft,
   Calendar,
   Globe,
   Target,
   TrendingUp,
   Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Player {
   player_id: number;
   player_name: string;
   date_of_birth: string;
   nationality: string;
   role: string;
   batting_style?: string;
   bowling_style?: string;
   jersey_number: number;
   price_crores: number;
   team_name?: string;
   team_code?: string;
   team_color?: string;
}

interface PlayerStats {
   matches_played: number;
   runs_scored: number;
   balls_faced: number;
   fours: number;
   sixes: number;
   highest_score: number;
   fifties: number;
   hundreds: number;
   overs_bowled: number;
   runs_conceded: number;
   wickets_taken: number;
   best_bowling?: string;
   catches: number;
   stumping: number;
   strike_rate?: number;
   average?: number;
   economy_rate?: number;
}

interface RecentPerformance {
   match_id: number;
   match_date: string;
   opponent: string;
   runs_scored?: number;
   balls_faced?: number;
   wickets_taken?: number;
   overs_bowled?: number;
   runs_conceded?: number;
}

export default function PlayerDetailPage() {
   const params = useParams();
   const playerId = params.id as string;

   const [player, setPlayer] = useState<Player | null>(null);
   const [stats, setStats] = useState<PlayerStats | null>(null);
   const [recentPerformances, setRecentPerformances] = useState<
      RecentPerformance[]
   >([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPlayerData = async () => {
         try {
            // Fetch player details
            const playerResponse = await fetch(`/api/players/${playerId}`);
            if (playerResponse.ok) {
               const playerData = await playerResponse.json();
               setPlayer(playerData);
            }

            // Fetch player stats
            const statsResponse = await fetch(`/api/players/${playerId}/stats`);
            if (statsResponse.ok) {
               const statsData = await statsResponse.json();
               setStats(statsData);
            }

            // Fetch recent performances
            const performancesResponse = await fetch(
               `/api/players/${playerId}/performances?limit=10`
            );
            if (performancesResponse.ok) {
               const performancesData = await performancesResponse.json();
               setRecentPerformances(performancesData);
            }
         } catch (error) {
            console.error("Error fetching player data:", error);
         } finally {
            setLoading(false);
         }
      };

      if (playerId) {
         fetchPlayerData();
      }
   }, [playerId]);

   if (loading) {
      return (
         <div className="container mx-auto p-6">
            <div className="animate-pulse space-y-6">
               <div className="h-8 bg-gray-200 rounded w-1/4"></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                     <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-64 bg-gray-200 rounded"></div>
               </div>
            </div>
         </div>
      );
   }

   if (!player) {
      return (
         <div className="container mx-auto p-6">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-gray-900">
                  Player not found
               </h1>
               <p className="text-gray-600 mt-2">
                  The player you're looking for doesn't exist.
               </p>
               <Link href="/players">
                  <Button className="mt-4">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to Players
                  </Button>
               </Link>
            </div>
         </div>
      );
   }

   const calculateAge = (dateOfBirth: string) => {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
         monthDiff < 0 ||
         (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
         age--;
      }
      return age;
   };

   return (
      <div className="container mx-auto p-6">
         {/* Header */}
         <div className="mb-6">
            <Link href="/players">
               <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Players
               </Button>
            </Link>

            <div className="flex items-center space-x-4">
               <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-white text-lg font-bold bg-gradient-to-br from-blue-500 to-purple-600">
                     {player.player_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                  </AvatarFallback>
               </Avatar>
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                     {player.player_name}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                     <Badge variant="secondary">{player.role}</Badge>
                     <Badge variant="outline">#{player.jersey_number}</Badge>
                     {player.team_name && (
                        <Link href={`/teams/${player.team_name}`}>
                           <Badge
                              variant="outline"
                              style={{
                                 borderColor: player.team_color?.toLowerCase(),
                              }}
                           >
                              {player.team_code}
                           </Badge>
                        </Link>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
               <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                     <TabsTrigger value="overview">Overview</TabsTrigger>
                     <TabsTrigger value="batting">Batting</TabsTrigger>
                     <TabsTrigger value="bowling">Bowling</TabsTrigger>
                     <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Player Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                 <Calendar className="h-4 w-4 text-gray-500" />
                                 <span className="text-sm text-gray-600">
                                    Age:
                                 </span>
                                 <span className="font-medium">
                                    {calculateAge(player.date_of_birth)} years
                                 </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Globe className="h-4 w-4 text-gray-500" />
                                 <span className="text-sm text-gray-600">
                                    Nationality:
                                 </span>
                                 <span className="font-medium">
                                    {player.nationality}
                                 </span>
                              </div>
                              {player.batting_style && (
                                 <div className="flex items-center space-x-2">
                                    <Target className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                       Batting:
                                    </span>
                                    <span className="font-medium">
                                       {player.batting_style}
                                    </span>
                                 </div>
                              )}
                              {player.bowling_style && (
                                 <div className="flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">
                                       Bowling:
                                    </span>
                                    <span className="font-medium">
                                       {player.bowling_style}
                                    </span>
                                 </div>
                              )}
                           </div>
                           <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">
                                 IPL Price:
                              </span>
                              <span className="font-medium text-green-600">
                                 ₹{player.price_crores} Crores
                              </span>
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="batting" className="space-y-6">
                     {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.runs_scored}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Total Runs
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.highest_score}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Highest Score
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.balls_faced > 0
                                       ? (
                                            (stats.runs_scored /
                                               stats.balls_faced) *
                                            100
                                         ).toFixed(1)
                                       : "0.0"}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Strike Rate
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.sixes}
                                 </div>
                                 <p className="text-xs text-gray-600">Sixes</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.fours}
                                 </div>
                                 <p className="text-xs text-gray-600">Fours</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.fifties}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Fifties
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.hundreds}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Hundreds
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.matches_played > 0 &&
                                    stats.runs_scored > 0
                                       ? (
                                            stats.runs_scored /
                                            stats.matches_played
                                         ).toFixed(1)
                                       : "0.0"}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Average
                                 </p>
                              </CardContent>
                           </Card>
                        </div>
                     )}
                  </TabsContent>

                  <TabsContent value="bowling" className="space-y-6">
                     {stats && stats.overs_bowled > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.wickets_taken}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Wickets
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.overs_bowled}
                                 </div>
                                 <p className="text-xs text-gray-600">Overs</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.overs_bowled > 0
                                       ? (
                                            stats.runs_conceded /
                                            stats.overs_bowled
                                         ).toFixed(2)
                                       : "0.00"}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Economy Rate
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {stats.best_bowling || "N/A"}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Best Bowling
                                 </p>
                              </CardContent>
                           </Card>
                        </div>
                     )}
                     {stats && stats.overs_bowled === 0 && (
                        <Card>
                           <CardContent className="pt-6">
                              <p className="text-center text-gray-500">
                                 No bowling statistics available
                              </p>
                           </CardContent>
                        </Card>
                     )}
                  </TabsContent>

                  <TabsContent value="recent" className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Recent Performances</CardTitle>
                           <CardDescription>
                              Last 10 match performances
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                              {recentPerformances.length > 0 ? (
                                 recentPerformances.map((performance) => (
                                    <div
                                       key={performance.match_id}
                                       className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                       <div>
                                          <p className="font-medium">
                                             vs {performance.opponent}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                             {new Date(
                                                performance.match_date
                                             ).toLocaleDateString()}
                                          </p>
                                       </div>
                                       <div className="text-right space-y-1">
                                          {performance.runs_scored !==
                                             undefined && (
                                             <p className="text-sm">
                                                <span className="font-medium">
                                                   {performance.runs_scored}
                                                </span>
                                                {performance.balls_faced &&
                                                   ` (${performance.balls_faced})`}
                                             </p>
                                          )}
                                          {performance.wickets_taken !==
                                             undefined &&
                                             performance.wickets_taken > 0 && (
                                                <p className="text-sm text-blue-600">
                                                   {performance.wickets_taken}/
                                                   {performance.runs_conceded}
                                                   {performance.overs_bowled &&
                                                      ` (${performance.overs_bowled})`}
                                                </p>
                                             )}
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <p className="text-center text-gray-500 py-4">
                                    No recent performances available
                                 </p>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>
               </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {stats && (
                  <Card>
                     <CardHeader>
                        <CardTitle>Career Summary</CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                 Matches
                              </span>
                              <span className="font-medium">
                                 {stats.matches_played}
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                 Catches
                              </span>
                              <span className="font-medium">
                                 {stats.catches}
                              </span>
                           </div>
                           {stats.stumping > 0 && (
                              <div className="flex justify-between">
                                 <span className="text-sm text-gray-600">
                                    Stumpings
                                 </span>
                                 <span className="font-medium">
                                    {stats.stumping}
                                 </span>
                              </div>
                           )}
                        </div>
                     </CardContent>
                  </Card>
               )}

               <Card>
                  <CardHeader>
                     <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     <Link
                        href={`/players/${playerId}/performances`}
                        className="block"
                     >
                        <Button variant="outline" className="w-full">
                           View All Performances
                        </Button>
                     </Link>
                     <Link
                        href={`/players/${playerId}/stats`}
                        className="block"
                     >
                        <Button variant="outline" className="w-full">
                           Detailed Stats
                        </Button>
                     </Link>
                     {player.team_name && (
                        <Link
                           href={`/teams/${player.team_name}`}
                           className="block"
                        >
                           <Button variant="outline" className="w-full">
                              View Team
                           </Button>
                        </Link>
                     )}
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}

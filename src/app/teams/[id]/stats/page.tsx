"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BarChart3, Target, Trophy, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
   team_id: number;
   team_name: string;
   team_code: string;
   team_color: string;
}

interface TeamStats {
   matches_played: number;
   matches_won: number;
   matches_lost: number;
   points: number;
   net_run_rate: number;
   no_results: number;
}

export default function TeamStatsPage() {
   const params = useParams();
   const teamId = params.id as string;

   const [team, setTeam] = useState<Team | null>(null);
   const [stats, setStats] = useState<TeamStats | null>(null);
   const [loading, setLoading] = useState(true);

   // Helper function to safely parse numeric values
   const safeNumber = (value: any, defaultValue: number = 0): number => {
      const num = typeof value === "string" ? parseFloat(value) : Number(value);
      return isNaN(num) ? defaultValue : num;
   };

   // Helper function to safely format decimal numbers
   const safeToFixed = (
      value: any,
      decimals: number = 2,
      defaultValue: number = 0
   ): string => {
      const num = safeNumber(value, defaultValue);
      return num.toFixed(decimals);
   };

   useEffect(() => {
      const fetchData = async () => {
         try {
            // Fetch team details
            const teamResponse = await fetch(`/api/teams/${teamId}`);
            if (teamResponse.ok) {
               const teamData = await teamResponse.json();
               setTeam(teamData);
            }

            // Fetch team stats
            const statsResponse = await fetch(`/api/teams/${teamId}/stats`);
            if (statsResponse.ok) {
               const statsData = await statsResponse.json();
               setStats(statsData);
            }
         } catch (error) {
            console.error("Error fetching data:", error);
         } finally {
            setLoading(false);
         }
      };

      if (teamId) {
         fetchData();
      }
   }, [teamId]);

   if (loading) {
      return (
         <div className="container mx-auto p-6">
            <div className="animate-pulse space-y-6">
               <div className="h-8 bg-gray-200 rounded w-1/4"></div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                     <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   if (!team) {
      return (
         <div className="container mx-auto p-6">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-gray-900">
                  Team not found
               </h1>
               <p className="text-gray-600 mt-2">
                  The team you're looking for doesn't exist.
               </p>
               <Link href="/teams">
                  <Button className="mt-4">
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Back to Teams
                  </Button>
               </Link>
            </div>
         </div>
      );
   }

   const winPercentage = stats
      ? safeNumber(stats.matches_played) > 0
         ? Math.round(
              (safeNumber(stats.matches_won) /
                 safeNumber(stats.matches_played)) *
                 100
           )
         : 0
      : 0;

   const lossPercentage = stats
      ? safeNumber(stats.matches_played) > 0
         ? Math.round(
              (safeNumber(stats.matches_lost) /
                 safeNumber(stats.matches_played)) *
                 100
           )
         : 0
      : 0;

   return (
      <div className="container mx-auto p-6">
         {/* Header */}
         <div className="mb-6">
            <Link href={`/teams/${teamId}`}>
               <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Team
               </Button>
            </Link>

            <div className="flex items-center space-x-4">
               <Avatar className="h-16 w-16">
                  <AvatarFallback
                     className="text-white text-lg font-bold"
                     style={{
                        backgroundColor:
                           team.team_color?.toLowerCase() || "#6366f1",
                     }}
                  >
                     {team.team_code}
                  </AvatarFallback>
               </Avatar>
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                     {team.team_name} Statistics
                  </h1>
                  <p className="text-gray-600">
                     Detailed performance statistics for {team.team_name}
                  </p>
               </div>
            </div>
         </div>

         {stats ? (
            <div className="space-y-6">
               {/* Main Stats Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           Matches Played
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold">
                           {safeNumber(stats.matches_played)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Total matches in the season
                        </p>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           Matches Won
                        </CardTitle>
                        <Trophy className="h-4 w-4 text-green-600" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                           {safeNumber(stats.matches_won)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           {winPercentage}% win rate
                        </p>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           Matches Lost
                        </CardTitle>
                        <Target className="h-4 w-4 text-red-600" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                           {safeNumber(stats.matches_lost)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           {lossPercentage}% loss rate
                        </p>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           Points
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                           {safeNumber(stats.points)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           League table points
                        </p>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           Net Run Rate
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                           {safeToFixed(stats.net_run_rate, 3)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Run rate differential
                        </p>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                           No Results
                        </CardTitle>
                        <Target className="h-4 w-4 text-gray-600" />
                     </CardHeader>
                     <CardContent>
                        <div className="text-2xl font-bold text-gray-600">
                           {safeNumber(stats.no_results)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                           Matches with no result
                        </p>
                     </CardContent>
                  </Card>
               </div>

               {/* Performance Summary */}
               <Card>
                  <CardHeader>
                     <CardTitle>Performance Summary</CardTitle>
                     <CardDescription>
                        Overall season performance metrics
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Win Rate</span>
                           <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                 <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${winPercentage}%` }}
                                 ></div>
                              </div>
                              <span className="text-sm font-medium">
                                 {winPercentage}%
                              </span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Loss Rate</span>
                           <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                 <div
                                    className="bg-red-600 h-2 rounded-full"
                                    style={{ width: `${lossPercentage}%` }}
                                 ></div>
                              </div>
                              <span className="text-sm font-medium">
                                 {lossPercentage}%
                              </span>
                           </div>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">
                              Points per Match
                           </span>
                           <span className="text-sm font-medium">
                              {safeNumber(stats.matches_played) > 0
                                 ? safeToFixed(
                                      safeNumber(stats.points) /
                                         safeNumber(stats.matches_played),
                                      2
                                   )
                                 : "0.00"}
                           </span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         ) : (
            <Card>
               <CardContent className="pt-6">
                  <div className="text-center py-8">
                     <p className="text-gray-500">No statistics available</p>
                     <p className="text-sm text-gray-400 mt-1">
                        No season statistics found for this team
                     </p>
                  </div>
               </CardContent>
            </Card>
         )}
      </div>
   );
}

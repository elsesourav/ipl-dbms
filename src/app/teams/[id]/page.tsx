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
import { ArrowLeft, Calendar, MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
   team_id: number;
   team_name: string;
   team_code: string;
   city: string;
   founded_year: number;
   owner: string;
   coach: string;
   home_ground: string;
   team_color: string;
   captain_name?: string;
}

interface Player {
   player_id: number;
   player_name: string;
   role: string;
   nationality: string;
   jersey_number: number;
   price_crores: number;
   batting_style?: string;
   bowling_style?: string;
}

interface TeamStats {
   matches_played: number;
   matches_won: number;
   matches_lost: number;
   points: number;
   net_run_rate: number;
}

interface Match {
   match_id: number;
   match_date: string;
   opponent: string;
   venue: string;
   result: string;
   win_margin?: number;
   win_type?: string;
}

export default function TeamDetailPage() {
   const params = useParams();
   const teamId = params.id as string;

   const [team, setTeam] = useState<Team | null>(null);
   const [players, setPlayers] = useState<Player[]>([]);
   const [stats, setStats] = useState<TeamStats | null>(null);
   const [recentMatches, setRecentMatches] = useState<Match[]>([]);
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
      const fetchTeamData = async () => {
         try {
            // Fetch team details
            const teamResponse = await fetch(`/api/teams/${teamId}`);
            if (teamResponse.ok) {
               const teamData = await teamResponse.json();
               setTeam(teamData);
            }

            // Fetch team players
            const playersResponse = await fetch(`/api/teams/${teamId}/players`);
            if (playersResponse.ok) {
               const playersData = await playersResponse.json();
               setPlayers(playersData);
            }

            // Fetch team stats
            const statsResponse = await fetch(`/api/teams/${teamId}/stats`);
            if (statsResponse.ok) {
               const statsData = await statsResponse.json();
               setStats(statsData);
            }

            // Fetch recent matches
            const matchesResponse = await fetch(
               `/api/teams/${teamId}/matches?limit=10`
            );
            if (matchesResponse.ok) {
               const matchesData = await matchesResponse.json();
               // Handle both old and new API response formats
               if (matchesData.success && matchesData.data) {
                  setRecentMatches(matchesData.data);
               } else if (Array.isArray(matchesData)) {
                  setRecentMatches(matchesData);
               } else {
                  setRecentMatches([]);
               }
            }
         } catch (error) {
            console.error("Error fetching team data:", error);
         } finally {
            setLoading(false);
         }
      };

      if (teamId) {
         fetchTeamData();
      }
   }, [teamId]);

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

   const groupedPlayers = players.reduce((acc, player) => {
      if (!acc[player.role]) {
         acc[player.role] = [];
      }
      acc[player.role].push(player);
      return acc;
   }, {} as Record<string, Player[]>);

   return (
      <div className="container mx-auto p-6">
         {/* Header */}
         <div className="mb-6">
            <Link href="/teams">
               <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Teams
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
                     {team.team_name}
                  </h1>
                  <p className="text-gray-600">{team.team_code}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
               <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                     <TabsTrigger value="overview">Overview</TabsTrigger>
                     <TabsTrigger value="players">Players</TabsTrigger>
                     <TabsTrigger value="matches">Matches</TabsTrigger>
                     <TabsTrigger value="stats">Statistics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Team Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="flex items-center space-x-2">
                                 <MapPin className="h-4 w-4 text-gray-500" />
                                 <span className="text-sm text-gray-600">
                                    Home Ground:
                                 </span>
                                 <span className="font-medium">
                                    {team.home_ground}
                                 </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Calendar className="h-4 w-4 text-gray-500" />
                                 <span className="text-sm text-gray-600">
                                    Founded:
                                 </span>
                                 <span className="font-medium">
                                    {team.founded_year}
                                 </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Users className="h-4 w-4 text-gray-500" />
                                 <span className="text-sm text-gray-600">
                                    Owner:
                                 </span>
                                 <span className="font-medium">
                                    {team.owner}
                                 </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                 <Users className="h-4 w-4 text-gray-500" />
                                 <span className="text-sm text-gray-600">
                                    Coach:
                                 </span>
                                 <span className="font-medium">
                                    {team.coach}
                                 </span>
                              </div>
                           </div>
                           <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">
                                 Team Colors:
                              </span>
                              <Badge
                                 variant="secondary"
                                 style={{
                                    backgroundColor:
                                       team.team_color?.toLowerCase(),
                                    color: "white",
                                 }}
                              >
                                 {team.team_color}
                              </Badge>
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="players" className="space-y-6">
                     <div className="space-y-6">
                        {Object.entries(groupedPlayers).map(
                           ([role, rolePlayers]) => (
                              <Card key={role}>
                                 <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                       <span>{role}s</span>
                                       <Badge variant="secondary">
                                          {rolePlayers.length}
                                       </Badge>
                                    </CardTitle>
                                 </CardHeader>
                                 <CardContent>
                                    <div className="grid gap-4">
                                       {rolePlayers.map((player) => (
                                          <div
                                             key={player.player_id}
                                             className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                          >
                                             <div className="flex items-center space-x-4">
                                                <Avatar>
                                                   <AvatarFallback>
                                                      {player.player_name
                                                         .split(" ")
                                                         .map((n) => n[0])
                                                         .join("")}
                                                   </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                   <Link
                                                      href={`/players/${player.player_id}`}
                                                      className="font-medium hover:text-blue-600"
                                                   >
                                                      {player.player_name}
                                                   </Link>
                                                   <p className="text-sm text-gray-600">
                                                      {player.nationality}
                                                   </p>
                                                   {player.batting_style && (
                                                      <p className="text-xs text-gray-500">
                                                         {player.batting_style}
                                                      </p>
                                                   )}
                                                </div>
                                             </div>
                                             <div className="text-right">
                                                <Badge variant="outline">
                                                   #{player.jersey_number}
                                                </Badge>
                                                <p className="text-sm text-gray-600 mt-1">
                                                   ₹{player.price_crores}Cr
                                                </p>
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </CardContent>
                              </Card>
                           )
                        )}
                     </div>
                  </TabsContent>

                  <TabsContent value="matches" className="space-y-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Recent Matches</CardTitle>
                           <CardDescription>
                              Last 10 matches played by {team.team_name}
                           </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-4">
                              {recentMatches.length > 0 ? (
                                 recentMatches.map((match) => (
                                    <div
                                       key={match.match_id}
                                       className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                       <div>
                                          <p className="font-medium">
                                             vs {match.opponent}
                                          </p>
                                          <p className="text-sm text-gray-600">
                                             {match.venue}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                             {new Date(
                                                match.match_date
                                             ).toLocaleDateString()}
                                          </p>
                                       </div>
                                       <div className="text-right">
                                          <Badge
                                             variant={
                                                match.result === "Won"
                                                   ? "default"
                                                   : "destructive"
                                             }
                                          >
                                             {match.result}
                                          </Badge>
                                          {match.win_margin && (
                                             <p className="text-sm text-gray-600 mt-1">
                                                by {match.win_margin}{" "}
                                                {match.win_type}
                                             </p>
                                          )}
                                       </div>
                                    </div>
                                 ))
                              ) : (
                                 <p className="text-center text-gray-500 py-4">
                                    No recent matches available
                                 </p>
                              )}
                           </div>
                        </CardContent>
                     </Card>
                  </TabsContent>

                  <TabsContent value="stats" className="space-y-6">
                     {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {safeNumber(stats.matches_played)}
                                 </div>
                                 <p className="text-xs text-gray-600">
                                    Matches Played
                                 </p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold text-green-600">
                                    {safeNumber(stats.matches_won)}
                                 </div>
                                 <p className="text-xs text-gray-600">Won</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold text-red-600">
                                    {safeNumber(stats.matches_lost)}
                                 </div>
                                 <p className="text-xs text-gray-600">Lost</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {safeNumber(stats.points)}
                                 </div>
                                 <p className="text-xs text-gray-600">Points</p>
                              </CardContent>
                           </Card>
                           <Card>
                              <CardContent className="pt-6">
                                 <div className="text-2xl font-bold">
                                    {safeToFixed(stats.net_run_rate, 2)}
                                 </div>
                                 <p className="text-xs text-gray-600">NRR</p>
                              </CardContent>
                           </Card>
                        </div>
                     )}
                  </TabsContent>
               </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
               {stats && (
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                           <Trophy className="h-5 w-5" />
                           <span>Current Season</span>
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="space-y-3">
                           <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                 Win Rate
                              </span>
                              <span className="font-medium">
                                 {safeNumber(stats.matches_played) > 0
                                    ? Math.round(
                                         (safeNumber(stats.matches_won) /
                                            safeNumber(stats.matches_played)) *
                                            100
                                      )
                                    : 0}
                                 %
                              </span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                 Position
                              </span>
                              <span className="font-medium">TBD</span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               )}

               <Card>
                  <CardHeader>
                     <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                     <Link href={`/teams/${teamId}/matches`} className="block">
                        <Button variant="outline" className="w-full">
                           View All Matches
                        </Button>
                     </Link>
                     <Link href={`/teams/${teamId}/stats`} className="block">
                        <Button variant="outline" className="w-full">
                           Detailed Stats
                        </Button>
                     </Link>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}

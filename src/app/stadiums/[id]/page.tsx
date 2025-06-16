"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   BarChart,
   Calendar,
   MapPin,
   Target,
   Trophy,
   Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Stadium {
   stadium_id: number;
   stadium_name: string;
   city: string;
   state: string;
   capacity: number;
}

interface Match {
   match_id: number;
   match_date: string;
   team1_name: string;
   team1_short: string;
   team1_logo: string;
   team2_name: string;
   team2_short: string;
   team2_logo: string;
   winner_name: string;
   winner_short: string;
   win_margin: string;
   win_type: string;
   series_name: string;
   series_year: number;
}

interface TeamPerformance {
   team_id: number;
   team_name: string;
   team_code: string;
   team_color: string;
   matches_played: number;
   wins: number;
   losses: number;
}

interface Statistics {
   total_matches: number;
   completed_matches: number;
   completion_rate: string;
   toss_advantage: string;
   avg_runs_margin: number | null;
   avg_wickets_margin: number | null;
}

interface StadiumData {
   stadium: Stadium;
   matches: Match[];
   statistics: Statistics;
   team_performance: TeamPerformance[];
}

export default function StadiumDetailPage() {
   const params = useParams();
   const [stadiumData, setStadiumData] = useState<StadiumData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchStadium = async () => {
         try {
            const response = await fetch(`/api/stadiums/${params.id}`);
            if (!response.ok) {
               throw new Error("Failed to fetch stadium data");
            }
            const data = await response.json();
            setStadiumData(data);
         } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
         } finally {
            setLoading(false);
         }
      };

      if (params.id) {
         fetchStadium();
      }
   }, [params.id]);

   if (loading) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-64">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading stadium details...</p>
               </div>
            </div>
         </div>
      );
   }

   if (error || !stadiumData) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
               <p className="text-gray-600 mb-4">
                  {error || "Stadium not found"}
               </p>
               <Button asChild>
                  <Link href="/stadiums">Back to Stadiums</Link>
               </Button>
            </div>
         </div>
      );
   }

   const { stadium, matches, statistics, team_performance } = stadiumData;

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Stadium Header */}
         <Card className="mb-8">
            <CardHeader>
               <CardTitle className="text-3xl mb-4">
                  {stadium.stadium_name}
               </CardTitle>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-600">
                  <div className="flex items-center">
                     <MapPin className="h-5 w-5 mr-2" />
                     {stadium.city}, {stadium.state}
                  </div>
                  <div className="flex items-center">
                     <Users className="h-5 w-5 mr-2" />
                     {stadium.capacity.toLocaleString()} capacity
                  </div>
                  <div className="flex items-center">
                     <Calendar className="h-5 w-5 mr-2" />
                     {statistics.total_matches} matches hosted
                  </div>
               </div>
            </CardHeader>
         </Card>

         {/* Statistics Overview */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Total Matches
                        </p>
                        <p className="text-2xl font-bold">
                           {statistics.total_matches}
                        </p>
                     </div>
                     <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Completion Rate
                        </p>
                        <p className="text-2xl font-bold">
                           {statistics.completion_rate}%
                        </p>
                     </div>
                     <Target className="h-8 w-8 text-green-600" />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Toss Advantage
                        </p>
                        <p className="text-2xl font-bold">
                           {statistics.toss_advantage}%
                        </p>
                     </div>
                     <Trophy className="h-8 w-8 text-purple-600" />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Avg Win Margin
                        </p>
                        <p className="text-2xl font-bold">
                           {statistics.avg_runs_margin
                              ? `${statistics.avg_runs_margin}R`
                              : statistics.avg_wickets_margin
                              ? `${statistics.avg_wickets_margin}W`
                              : "N/A"}
                        </p>
                     </div>
                     <BarChart className="h-8 w-8 text-orange-600" />
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Tabs */}
         <Tabs defaultValue="matches" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="matches">Recent Matches</TabsTrigger>
               <TabsTrigger value="teams">Team Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
               <Card>
                  <CardHeader>
                     <CardTitle>
                        Recent Matches at {stadium.stadium_name}
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {matches.length > 0 ? (
                           matches.slice(0, 10).map((match) => (
                              <div
                                 key={match.match_id}
                                 className="border rounded-lg p-4 hover:bg-gray-50"
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                       <div className="flex items-center space-x-2">
                                          {match.team1_logo && (
                                             <Image
                                                src={match.team1_logo}
                                                alt={match.team1_name}
                                                width={24}
                                                height={24}
                                             />
                                          )}
                                          <span className="font-medium">
                                             {match.team1_short}
                                          </span>
                                       </div>
                                       <span className="text-gray-400">vs</span>
                                       <div className="flex items-center space-x-2">
                                          {match.team2_logo && (
                                             <Image
                                                src={match.team2_logo}
                                                alt={match.team2_name}
                                                width={24}
                                                height={24}
                                             />
                                          )}
                                          <span className="font-medium">
                                             {match.team2_short}
                                          </span>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       {match.winner_name && (
                                          <Badge
                                             variant="secondary"
                                             className="mb-1"
                                          >
                                             {match.winner_short} won by{" "}
                                             {match.win_margin}
                                          </Badge>
                                       )}
                                       <p className="text-sm text-gray-600">
                                          {new Date(
                                             match.match_date
                                          ).toLocaleDateString()}{" "}
                                          • {match.series_name}{" "}
                                          {match.series_year}
                                       </p>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                       <Link
                                          href={`/matches/${match.match_id}`}
                                       >
                                          View Details
                                       </Link>
                                    </Button>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-center text-gray-600 py-8">
                              No matches found for this stadium.
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="teams">
               <Card>
                  <CardHeader>
                     <CardTitle>
                        Team Performance at {stadium.stadium_name}
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {team_performance.length > 0 ? (
                           team_performance.map((team) => (
                              <div
                                 key={team.team_id}
                                 className="border rounded-lg p-4"
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                       {team.team_color && (
                                          <Image
                                             src={team.team_color}
                                             alt={team.team_name}
                                             width={40}
                                             height={40}
                                          />
                                       )}
                                       <div>
                                          <h3 className="font-medium">
                                             {team.team_name}
                                          </h3>
                                          <p className="text-sm text-gray-600">
                                             {team.team_code}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="text-right space-x-4">
                                       <div className="grid grid-cols-3 gap-4 text-sm">
                                          <div className="text-center">
                                             <p className="font-medium">
                                                {team.matches_played}
                                             </p>
                                             <p className="text-gray-600">
                                                Matches
                                             </p>
                                          </div>
                                          <div className="text-center">
                                             <p className="font-medium text-green-600">
                                                {team.wins}
                                             </p>
                                             <p className="text-gray-600">
                                                Wins
                                             </p>
                                          </div>
                                          <div className="text-center">
                                             <p className="font-medium text-red-600">
                                                {team.losses}
                                             </p>
                                             <p className="text-gray-600">
                                                Losses
                                             </p>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <Badge variant="outline">
                                          {team.matches_played > 0
                                             ? (
                                                  (team.wins /
                                                     team.matches_played) *
                                                  100
                                               ).toFixed(0)
                                             : 0}
                                          % Win Rate
                                       </Badge>
                                    </div>
                                    <Button asChild variant="outline" size="sm">
                                       <Link href={`/teams/${team.team_id}`}>
                                          View Team
                                       </Link>
                                    </Button>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-center text-gray-600 py-8">
                              No team performance data available.
                           </p>
                        )}
                     </div>
                  </CardContent>
               </Card>
            </TabsContent>
         </Tabs>

         {/* Back Button */}
         <div className="mt-8">
            <Button asChild variant="outline">
               <Link href="/stadiums">← Back to Stadiums</Link>
            </Button>
         </div>
      </div>
   );
}

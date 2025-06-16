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
import { ArrowLeft, Calendar, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
   team_id: number;
   team_name: string;
   team_code: string;
   team_color: string;
}

interface Match {
   match_id: number;
   match_date: string;
   match_type: string;
   opponent: string;
   venue: string;
   venue_city: string;
   result: string;
   win_margin?: number;
   win_type?: string;
}

export default function TeamMatchesPage() {
   const params = useParams();
   const teamId = params.id as string;

   const [team, setTeam] = useState<Team | null>(null);
   const [matches, setMatches] = useState<Match[]>([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchData = async () => {
         try {
            // Fetch team details
            const teamResponse = await fetch(`/api/teams/${teamId}`);
            if (teamResponse.ok) {
               const teamData = await teamResponse.json();
               setTeam(teamData);
            }

            // Fetch all matches for the team
            const matchesResponse = await fetch(
               `/api/teams/${teamId}/matches?limit=50`
            );
            if (matchesResponse.ok) {
               const matchesData = await matchesResponse.json();
               if (matchesData.success && matchesData.data) {
                  setMatches(matchesData.data);
               } else if (Array.isArray(matchesData)) {
                  setMatches(matchesData);
               } else {
                  setMatches([]);
               }
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
               <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                     <div key={i} className="h-20 bg-gray-200 rounded"></div>
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

   const getResultColor = (result: string) => {
      switch (result) {
         case "Won":
            return "default";
         case "Lost":
            return "destructive";
         case "No Result":
            return "secondary";
         default:
            return "outline";
      }
   };

   const getMatchTypeLabel = (type: string) => {
      switch (type) {
         case "league":
            return "League";
         case "qualifier1":
            return "Qualifier 1";
         case "qualifier2":
            return "Qualifier 2";
         case "eliminator":
            return "Eliminator";
         case "final":
            return "Final";
         default:
            return type;
      }
   };

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
                     {team.team_name} Matches
                  </h1>
                  <p className="text-gray-600">
                     All completed matches for {team.team_name}
                  </p>
               </div>
            </div>
         </div>

         {/* Matches List */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Match History</span>
               </CardTitle>
               <CardDescription>
                  Complete match history for {team.team_name}
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  {matches.length > 0 ? (
                     matches.map((match) => (
                        <div
                           key={match.match_id}
                           className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                           <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                 <div>
                                    <h3 className="font-semibold text-lg">
                                       vs {match.opponent}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                       <div className="flex items-center space-x-1">
                                          <Calendar className="h-4 w-4" />
                                          <span>
                                             {new Date(
                                                match.match_date
                                             ).toLocaleDateString("en-US", {
                                                weekday: "short",
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                             })}
                                          </span>
                                       </div>
                                       <div className="flex items-center space-x-1">
                                          <MapPin className="h-4 w-4" />
                                          <span>
                                             {match.venue}, {match.venue_city}
                                          </span>
                                       </div>
                                       <Badge variant="outline">
                                          {getMatchTypeLabel(match.match_type)}
                                       </Badge>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <Badge
                                 variant={getResultColor(match.result)}
                                 className="mb-2"
                              >
                                 {match.result}
                              </Badge>
                              {match.win_margin && (
                                 <p className="text-sm text-gray-600">
                                    by {match.win_margin}{" "}
                                    {match.win_type === "runs" ? "runs" : "wickets"}
                                 </p>
                              )}
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-8">
                        <p className="text-gray-500">No matches found</p>
                        <p className="text-sm text-gray-400 mt-1">
                           No completed matches available for this team
                        </p>
                     </div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

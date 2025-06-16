"use client";

// Force dynamic rendering for API calls
export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MatchResult {
   match_id: number;
   match_number?: number;
   match_date: string;
   team1_name: string;
   team1_code: string;
   team2_name: string;
   team2_code: string;
   stadium_name: string;
   city: string;
   toss_winner?: string;
   toss_decision?: "bat" | "bowl";
   winner?: string;
   win_type?: "runs" | "wickets" | "no_result";
   win_margin?: number;
   man_of_match?: string;
   is_completed: boolean;
}

export default function MatchesPage() {
   const [matches, setMatches] = useState<MatchResult[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [filter, setFilter] = useState<"all" | "completed" | "upcoming">(
      "all"
   );

   useEffect(() => {
      fetchMatches();
   }, []);

   const fetchMatches = async () => {
      try {
         const response = await fetch("/api/matches");
         if (response.ok) {
            const data = await response.json();
            setMatches(data);
         } else {
            setError("Failed to fetch matches");
         }
      } catch (err) {
         setError("An error occurred while fetching matches");
      } finally {
         setLoading(false);
      }
   };

   const filteredMatches = matches.filter((match) => {
      if (filter === "completed") return match.is_completed;
      if (filter === "upcoming") return !match.is_completed;
      return true;
   });

   const getTeamColorClass = (teamCode: string) => {
      const colors: Record<string, string> = {
         MI: "bg-blue-600 text-white",
         CSK: "bg-yellow-500 text-black",
         RCB: "bg-red-600 text-white",
         KKR: "bg-purple-600 text-white",
         DC: "bg-blue-700 text-white",
         PBKS: "bg-red-500 text-white",
         RR: "bg-pink-500 text-white",
         SRH: "bg-orange-500 text-white",
      };
      return colors[teamCode] || "bg-gray-500 text-white";
   };

   const getMatchStatusBadge = (match: MatchResult) => {
      if (match.is_completed) {
         if (match.winner) {
            return (
               <Badge className="bg-green-100 text-green-800">Completed</Badge>
            );
         } else {
            return (
               <Badge className="bg-gray-100 text-gray-800">No Result</Badge>
            );
         }
      } else {
         const matchDate = new Date(match.match_date);
         const now = new Date();
         if (matchDate > now) {
            return (
               <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
            );
         } else {
            return (
               <Badge className="bg-yellow-100 text-yellow-800">Live</Badge>
            );
         }
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p>Loading matches...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 mb-4">{error}</p>
               <Button onClick={fetchMatches}>Try Again</Button>
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
                     IPL Matches
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                     View all IPL matches, results, and upcoming fixtures
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

            {/* Filters */}
            <div className="mb-6">
               <div className="flex flex-wrap gap-2">
                  <Button
                     variant={filter === "all" ? "default" : "outline"}
                     onClick={() => setFilter("all")}
                     size="sm"
                  >
                     All Matches ({matches.length})
                  </Button>
                  <Button
                     variant={filter === "completed" ? "default" : "outline"}
                     onClick={() => setFilter("completed")}
                     size="sm"
                  >
                     Completed ({matches.filter((m) => m.is_completed).length})
                  </Button>
                  <Button
                     variant={filter === "upcoming" ? "default" : "outline"}
                     onClick={() => setFilter("upcoming")}
                     size="sm"
                  >
                     Upcoming ({matches.filter((m) => !m.is_completed).length})
                  </Button>
               </div>
            </div>

            {/* Matches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredMatches.map((match) => (
                  <Card
                     key={match.match_id}
                     className="hover:shadow-lg transition-shadow"
                  >
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           {match.match_number && (
                              <div className="text-sm font-medium text-gray-500">
                                 Match {match.match_number}
                              </div>
                           )}
                           {getMatchStatusBadge(match)}
                        </div>

                        {/* Teams */}
                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div
                                    className={`px-2 py-1 rounded text-xs font-bold ${getTeamColorClass(
                                       match.team1_code
                                    )}`}
                                 >
                                    {match.team1_code}
                                 </div>
                                 <span className="text-sm font-medium">
                                    {match.team1_name}
                                 </span>
                              </div>
                              {match.winner === match.team1_name && (
                                 <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                           </div>

                           <div className="text-center text-gray-500 text-sm font-medium">
                              VS
                           </div>

                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                 <div
                                    className={`px-2 py-1 rounded text-xs font-bold ${getTeamColorClass(
                                       match.team2_code
                                    )}`}
                                 >
                                    {match.team2_code}
                                 </div>
                                 <span className="text-sm font-medium">
                                    {match.team2_name}
                                 </span>
                              </div>
                              {match.winner === match.team2_name && (
                                 <Trophy className="w-4 h-4 text-yellow-500" />
                              )}
                           </div>
                        </div>
                     </CardHeader>

                     <CardContent className="space-y-3">
                        {/* Date and Venue */}
                        <div className="flex items-center gap-2 text-sm">
                           <Calendar className="w-4 h-4 text-gray-500" />
                           <span>{formatDate(match.match_date)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                           <MapPin className="w-4 h-4 text-gray-500" />
                           <span>
                              {match.stadium_name}, {match.city}
                           </span>
                        </div>

                        {/* Match Result */}
                        {match.is_completed && match.winner && (
                           <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                              <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                 🏆 {match.winner} won
                                 {match.win_margin && match.win_type && (
                                    <span className="ml-1">
                                       by {match.win_margin} {match.win_type}
                                    </span>
                                 )}
                              </div>
                              {match.man_of_match && (
                                 <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Man of the Match: {match.man_of_match}
                                 </div>
                              )}
                           </div>
                        )}

                        {/* Toss Information */}
                        {match.toss_winner && match.toss_decision && (
                           <div className="text-xs text-gray-600 dark:text-gray-400">
                              Toss: {match.toss_winner} won and chose to{" "}
                              {match.toss_decision} first
                           </div>
                        )}
                     </CardContent>
                  </Card>
               ))}
            </div>

            {filteredMatches.length === 0 && !loading && (
               <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No matches found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                     {filter === "all"
                        ? "Initialize the database to see IPL matches."
                        : `No ${filter} matches found.`}
                  </p>
                  <div className="flex gap-4 justify-center">
                     <Button onClick={fetchMatches}>Refresh</Button>
                     {filter !== "all" && (
                        <Button
                           variant="outline"
                           onClick={() => setFilter("all")}
                        >
                           Show All Matches
                        </Button>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

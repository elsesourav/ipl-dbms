"use client";

// Force dynamic rendering for API calls
export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Award, Calendar, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Tournament {
   series_id: number;
   series_name: string;
   season_year: number;
   start_date?: string;
   end_date?: string;
   format: string;
   authority: string;
   num_teams: number;
   total_matches?: number;
   is_completed: boolean;
}

export default function TournamentsPage() {
   const [tournaments, setTournaments] = useState<Tournament[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      fetchTournaments();
   }, []);

   const fetchTournaments = async () => {
      try {
         setLoading(true);
         const response = await fetch("/api/tournaments");
         const result = await response.json();

         if (result.success) {
            // Map the API response to our component state
            const mappedTournaments = result.data.all.map(
               (tournament: any) => ({
                  series_id: tournament.series_id,
                  series_name: tournament.series_name,
                  season_year: tournament.season || new Date().getFullYear(),
                  start_date: tournament.start_date,
                  end_date: tournament.end_date,
                  format: "T20", // Default format since not in DB
                  authority: "BCCI", // Default authority since not in DB
                  num_teams: 10, // Default value since not easily calculated
                  total_matches: tournament.total_matches || 0,
                  is_completed: tournament.end_date
                     ? new Date(tournament.end_date) < new Date()
                     : false,
               })
            );

            setTournaments(mappedTournaments);
         } else {
            setError(result.error || "Failed to fetch tournaments");
         }
      } catch (err) {
         console.error("Error fetching tournaments:", err);
         setError("An error occurred while fetching tournaments");
      } finally {
         setLoading(false);
      }
   };

   const getTournamentStatusBadge = (tournament: Tournament) => {
      if (tournament.is_completed) {
         return (
            <Badge className="bg-green-100 text-green-800">Completed</Badge>
         );
      } else {
         const startDate = tournament.start_date
            ? new Date(tournament.start_date)
            : null;
         const endDate = tournament.end_date
            ? new Date(tournament.end_date)
            : null;
         const now = new Date();

         if (startDate && startDate > now) {
            return (
               <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
            );
         } else if (endDate && endDate < now) {
            return (
               <Badge className="bg-gray-100 text-gray-800">Finished</Badge>
            );
         } else {
            return (
               <Badge className="bg-yellow-100 text-yellow-800">Ongoing</Badge>
            );
         }
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p>Loading tournaments...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 mb-4">{error}</p>
               <Button onClick={fetchTournaments}>Try Again</Button>
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
                     IPL Tournaments
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                     Manage IPL seasons, series, and tournament structures
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

            {/* Tournament History Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Seasons
                     </CardTitle>
                     <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {tournaments.length}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Since inception
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Matches
                     </CardTitle>
                     <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {tournaments.reduce(
                           (sum, t) => sum + (t.total_matches || 0),
                           0
                        )}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Across all seasons
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Teams
                     </CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {tournaments.length > 0 ? tournaments[0].num_teams : 0}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Participating franchises
                     </p>
                  </CardContent>
               </Card>
            </div>

            {/* Tournaments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {tournaments.map((tournament) => (
                  <Card
                     key={tournament.series_id}
                     className="hover:shadow-lg transition-shadow"
                  >
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           <div className="text-sm font-medium text-gray-500">
                              Season {tournament.season_year}
                           </div>
                           {getTournamentStatusBadge(tournament)}
                        </div>
                        <CardTitle className="text-xl">
                           {tournament.series_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                           <Award className="w-4 h-4" />
                           {tournament.format} Tournament
                        </CardDescription>
                     </CardHeader>

                     <CardContent className="space-y-4">
                        {/* Tournament Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                           <div>
                              <span className="font-medium">Teams:</span>
                              <div className="flex items-center gap-1 mt-1">
                                 <Users className="w-3 h-3 text-gray-500" />
                                 <span>{tournament.num_teams}</span>
                              </div>
                           </div>
                           <div>
                              <span className="font-medium">Matches:</span>
                              <div className="flex items-center gap-1 mt-1">
                                 <Calendar className="w-3 h-3 text-gray-500" />
                                 <span>
                                    {tournament.total_matches || "TBD"}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Tournament Duration */}
                        {tournament.start_date && tournament.end_date && (
                           <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-sm font-medium mb-2">
                                 Tournament Duration
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                 <div>
                                    Start: {formatDate(tournament.start_date)}
                                 </div>
                                 <div>
                                    End: {formatDate(tournament.end_date)}
                                 </div>
                              </div>
                           </div>
                        )}

                        {/* Authority */}
                        <div className="flex items-center justify-between text-sm">
                           <span className="font-medium">Organized by:</span>
                           <Badge variant="outline">
                              {tournament.authority}
                           </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                           <Link
                              href={`/matches?tournament=${tournament.series_id}`}
                           >
                              <Button
                                 variant="outline"
                                 size="sm"
                                 className="w-full"
                              >
                                 View Matches
                              </Button>
                           </Link>
                           <Link
                              href={`/statistics?tournament=${tournament.series_id}`}
                           >
                              <Button size="sm" className="w-full">
                                 Statistics
                              </Button>
                           </Link>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>

            {tournaments.length === 0 && !loading && (
               <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No tournaments found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                     Initialize the database to see IPL tournaments and seasons.
                  </p>
                  <Button onClick={fetchTournaments}>Refresh</Button>
               </div>
            )}

            {/* IPL History Section */}
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
               <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                  IPL Tournament History
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                     <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        2008
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        IPL Inception
                     </div>
                     <div className="text-sm text-gray-500 mt-1">
                        First season with 8 teams
                     </div>
                  </div>
                  <div>
                     <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                        17+
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        Seasons Completed
                     </div>
                     <div className="text-sm text-gray-500 mt-1">
                        Years of entertainment
                     </div>
                  </div>
                  <div>
                     <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        1000+
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        Matches Played
                     </div>
                     <div className="text-sm text-gray-500 mt-1">
                        Across all seasons
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

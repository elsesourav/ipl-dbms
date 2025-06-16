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
import { Calendar, MapPin, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Team {
   team_id: number;
   team_name: string;
   team_code: string;
   city: string;
   founded_year?: number;
   owner?: string;
   coach?: string;
   home_ground?: string;
   team_color?: string;
   captain_name?: string;
}

export default function TeamsPage() {
   const [teams, setTeams] = useState<Team[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      fetchTeams();
   }, []);

   const fetchTeams = async () => {
      try {
         const response = await fetch("/api/teams");
         
         if (response.ok) {
            const { data } = await response.json();
            setTeams(data);
         } else {
            setError("Failed to fetch teams");
         }
      } catch (err) {
         setError("An error occurred while fetching teams");
      } finally {
         setLoading(false);
      }
   };

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

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p>Loading teams...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 mb-4">{error}</p>
               <Button onClick={fetchTeams}>Try Again</Button>
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
                     IPL Teams
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                     Manage and view all IPL teams and their details
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

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {teams.map((team) => (
                  <Card
                     key={team.team_id}
                     className="hover:shadow-lg transition-shadow"
                  >
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           <div
                              className={`px-3 py-1 rounded-full text-sm font-bold ${getTeamColorClass(
                                 team.team_code
                              )}`}
                           >
                              {team.team_code}
                           </div>
                           <Trophy className="w-5 h-5 text-yellow-500" />
                        </div>
                        <CardTitle className="text-xl">
                           {team.team_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                           <MapPin className="w-4 h-4" />
                           {team.city}
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        {team.founded_year && (
                           <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>Founded: {team.founded_year}</span>
                           </div>
                        )}

                        {team.captain_name && (
                           <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>Captain: {team.captain_name}</span>
                           </div>
                        )}

                        {team.coach && (
                           <div className="text-sm">
                              <span className="font-medium">Coach:</span>{" "}
                              {team.coach}
                           </div>
                        )}

                        {team.home_ground && (
                           <div className="text-sm">
                              <span className="font-medium">Home:</span>{" "}
                              {team.home_ground}
                           </div>
                        )}

                        {team.owner && (
                           <div className="text-sm">
                              <span className="font-medium">Owner:</span>{" "}
                              {team.owner}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               ))}
            </div>

            {teams.length === 0 && !loading && (
               <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No teams found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                     Initialize the database to see IPL teams.
                  </p>
                  <Button onClick={fetchTeams}>Refresh</Button>
               </div>
            )}
         </div>
      </div>
   );
}

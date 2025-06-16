"use client";

// Force dynamic rendering for API calls
export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateAge } from "@/lib/utils";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Player {
   player_id: number;
   player_name: string;
   date_of_birth?: string;
   nationality?: string;
   role: string;
   batting_style?: string;
   bowling_style?: string;
   jersey_number?: number;
   price_crores?: number;
   team_name?: string;
   team_code?: string;
}

export default function PlayersPage() {
   const [players, setPlayers] = useState<Player[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [selectedRole, setSelectedRole] = useState<string>("all");

   useEffect(() => {
      fetchPlayers();
   }, []);

   const fetchPlayers = async () => {
      try {
         const response = await fetch("/api/players");

         if (response.ok) {
            const { data } = await response.json();
            setPlayers(data);
         } else {
            setError("Failed to fetch players");
         }
      } catch (err) {
         setError("An error occurred while fetching players");
      } finally {
         setLoading(false);
      }
   };

   const filteredPlayers =
      selectedRole === "all"
         ? players
         : players.filter((player) => player.role === selectedRole);

   const roleColors = {
      Batsman: "bg-green-100 text-green-800",
      Bowler: "bg-red-100 text-red-800",
      "All-rounder": "bg-blue-100 text-blue-800",
      "Wicket-keeper": "bg-purple-100 text-purple-800",
   };

   const getTeamColorClass = (teamCode: string | undefined) => {
      if (!teamCode) return "bg-gray-500 text-white";
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
               <p>Loading players...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 mb-4">{error}</p>
               <Button onClick={fetchPlayers}>Try Again</Button>
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
                     IPL Players
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                     Browse all IPL players and their details
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
                     variant={selectedRole === "all" ? "default" : "outline"}
                     onClick={() => setSelectedRole("all")}
                     size="sm"
                  >
                     All Players ({players.length})
                  </Button>
                  {["Batsman", "Bowler", "All-rounder", "Wicket-keeper"].map(
                     (role) => (
                        <Button
                           key={role}
                           variant={
                              selectedRole === role ? "default" : "outline"
                           }
                           onClick={() => setSelectedRole(role)}
                           size="sm"
                        >
                           {role} (
                           {players.filter((p) => p.role === role).length})
                        </Button>
                     )
                  )}
               </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredPlayers.map((player) => (
                  <Card
                     key={player.player_id}
                     className="hover:shadow-lg transition-shadow"
                  >
                     <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                           {player.team_code && (
                              <div
                                 className={`px-2 py-1 rounded text-xs font-bold ${getTeamColorClass(
                                    player.team_code
                                 )}`}
                              >
                                 {player.team_code}
                              </div>
                           )}
                           {player.jersey_number && (
                              <div className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs font-bold">
                                 #{player.jersey_number}
                              </div>
                           )}
                        </div>
                        <CardTitle className="text-lg">
                           {player.player_name}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                           <Badge
                              className={
                                 roleColors[
                                    player.role as keyof typeof roleColors
                                 ] || "bg-gray-100 text-gray-800"
                              }
                           >
                              {player.role}
                           </Badge>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        {player.team_name && (
                           <div className="text-sm">
                              <span className="font-medium">Team:</span>{" "}
                              {player.team_name}
                           </div>
                        )}

                        {player.nationality && (
                           <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{player.nationality}</span>
                           </div>
                        )}

                        {player.date_of_birth && (
                           <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>
                                 Age: {calculateAge(player.date_of_birth)}
                              </span>
                           </div>
                        )}

                        {player.batting_style && (
                           <div className="text-sm">
                              <span className="font-medium">Batting:</span>{" "}
                              {player.batting_style}
                           </div>
                        )}

                        {player.bowling_style && (
                           <div className="text-sm">
                              <span className="font-medium">Bowling:</span>{" "}
                              {player.bowling_style}
                           </div>
                        )}

                        {player.price_crores && (
                           <div className="flex items-center gap-2 text-sm font-bold text-green-600">
                              <DollarSign className="w-4 h-4" />
                              <span>₹{player.price_crores} Cr</span>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               ))}
            </div>

            {filteredPlayers.length === 0 && !loading && (
               <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                     No players found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                     {selectedRole === "all"
                        ? "Initialize the database to see IPL players."
                        : `No ${selectedRole.toLowerCase()}s found.`}
                  </p>
                  <div className="flex gap-4 justify-center">
                     <Button onClick={fetchPlayers}>Refresh</Button>
                     {selectedRole !== "all" && (
                        <Button
                           variant="outline"
                           onClick={() => setSelectedRole("all")}
                        >
                           Show All Players
                        </Button>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

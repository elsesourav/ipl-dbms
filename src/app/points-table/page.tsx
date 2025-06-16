"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Minus, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PointsTableEntry {
   team_id: number;
   team_name: string;
   team_code: string;
   team_color: string;
   matches_played: number;
   matches_won: number;
   matches_lost: number;
   no_results: number;
   points: number;
   net_run_rate: number;
   position?: number;
}

interface Season {
   series_id: number;
   series_name: string;
   season_year: number;
   start_date: string;
   end_date: string;
   total_matches?: number;
   completed_matches?: number;
}

export default function PointsTablePage() {
   const [pointsTable, setPointsTable] = useState<PointsTableEntry[]>([]);
   const [seasons, setSeasons] = useState<Season[]>([]);
   const [selectedSeason, setSelectedSeason] = useState<string>("");
   const [loading, setLoading] = useState(true);

   // Helper function to safely convert to number and format
   const safeNumber = (value: any, defaultValue: number = 0): number => {
      if (value === null || value === undefined || value === "")
         return defaultValue;
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
      const fetchSeasons = async () => {
         try {
            const response = await fetch("/api/tournaments");
            if (response.ok) {
               const result = await response.json();
               if (result.success && result.data) {
                  // The API returns an object with 'all', 'ongoing', 'upcoming', 'past' properties
                  const allSeasons = result.data.all || [];
                  setSeasons(allSeasons);

                  console.log("Fetched seasons:", allSeasons);

                  // Set current season as default - prefer IPL 2024 (series_id = 1) which has data
                  let currentSeason = null;

                  // First try to find IPL 2024 specifically (series_id = 1)
                  currentSeason = allSeasons.find((s) => s.series_id === 1);

                  // If not found, try ongoing tournaments
                  if (
                     !currentSeason &&
                     result.data.ongoing &&
                     result.data.ongoing.length > 0
                  ) {
                     currentSeason = result.data.ongoing[0];
                  }
                  // Then try past tournaments (completed ones with data)
                  else if (
                     !currentSeason &&
                     result.data.past &&
                     result.data.past.length > 0
                  ) {
                     currentSeason = result.data.past[0];
                  }
                  // For "all" seasons, prefer ones that are likely to have data (2024 and earlier)
                  else if (!currentSeason && allSeasons.length > 0) {
                     currentSeason =
                        allSeasons.find((s) => s.season_year <= 2024) ||
                        allSeasons[0];
                  }

                  if (currentSeason) {
                     setSelectedSeason(currentSeason.series_id.toString());
                  }
               }
            }
         } catch (error) {
            console.error("Error fetching seasons:", error);
         }
      };

      fetchSeasons();
   }, []);

   useEffect(() => {
      const fetchPointsTable = async () => {
         if (!selectedSeason) return;

         setLoading(true);
         try {
            const response = await fetch(`/api/points-table/${selectedSeason}`);
            if (response.ok) {
               const data = await response.json();

               // The API now returns the array directly
               const dataWithPosition = data.map(
                  (team: PointsTableEntry, index: number) => ({
                     ...team,
                     position: index + 1,
                  })
               );
               setPointsTable(dataWithPosition);
            } else {
               console.error("Failed to fetch points table:", response.status);
               setPointsTable([]);
            }
         } catch (error) {
            console.error("Error fetching points table:", error);
            setPointsTable([]);
         } finally {
            setLoading(false);
         }
      };

      fetchPointsTable();
   }, [selectedSeason]);

   const getPositionIcon = (position: number) => {
      if (position <= 4) {
         return <TrendingUp className="h-4 w-4 text-green-600" />;
      } else if (position <= 6) {
         return <Minus className="h-4 w-4 text-yellow-600" />;
      } else {
         return <TrendingDown className="h-4 w-4 text-red-600" />;
      }
   };

   const getPositionBadge = (position: number) => {
      if (position <= 4) {
         return <Badge className="bg-green-100 text-green-800">Playoff</Badge>;
      } else if (position <= 6) {
         return <Badge variant="secondary">Mid-table</Badge>;
      } else {
         return <Badge variant="destructive">Bottom</Badge>;
      }
   };

   if (loading && pointsTable.length === 0) {
      return (
         <div className="container mx-auto p-6">
            <div className="animate-pulse space-y-6">
               <div className="h-8 bg-gray-200 rounded w-1/4"></div>
               <div className="h-64 bg-gray-200 rounded"></div>
            </div>
         </div>
      );
   }

   const selectedSeasonData = seasons.find(
      (s) => s.series_id.toString() === selectedSeason
   );

   return (
      <div className="container mx-auto p-6">
         {/* Header */}
         <div className="mb-6">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
                     <Trophy className="h-8 w-8 text-yellow-500" />
                     <span>Points Table</span>
                  </h1>
                  <p className="text-gray-600 mt-2">
                     IPL team standings and rankings
                  </p>
               </div>

               <div className="w-64">
                  <Select
                     value={selectedSeason}
                     onValueChange={setSelectedSeason}
                  >
                     <SelectTrigger>
                        <SelectValue placeholder="Select Season" />
                     </SelectTrigger>
                     <SelectContent>
                        {seasons.map((season) => (
                           <SelectItem
                              key={season.series_id}
                              value={season.series_id.toString()}
                           >
                              {season.series_name}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
            </div>
         </div>

         {/* Points Table */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center justify-between">
                  <span>
                     {selectedSeasonData?.series_name || "Points Table"}
                  </span>
                  {selectedSeasonData && (
                     <Badge
                        variant={
                           new Date(selectedSeasonData.end_date) < new Date()
                              ? "secondary"
                              : "default"
                        }
                     >
                        {new Date(selectedSeasonData.end_date) < new Date()
                           ? "Completed"
                           : "Ongoing"}
                     </Badge>
                  )}
               </CardTitle>
               <CardDescription>
                  Team standings based on points, with net run rate as
                  tiebreaker
               </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="border-b border-gray-200">
                           <th className="text-left py-3 px-2 font-medium text-gray-600">
                              Pos
                           </th>
                           <th className="text-left py-3 px-4 font-medium text-gray-600">
                              Team
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              M
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              W
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              L
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              NR
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              Pts
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              NRR
                           </th>
                           <th className="text-center py-3 px-2 font-medium text-gray-600">
                              Status
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {pointsTable.map((team) => (
                           <tr
                              key={team.team_id}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                           >
                              <td className="py-4 px-2">
                                 <div className="flex items-center space-x-2">
                                    <span className="font-medium text-lg">
                                       {team.position}
                                    </span>
                                    {getPositionIcon(team.position || 0)}
                                 </div>
                              </td>
                              <td className="py-4 px-4">
                                 <Link
                                    href={`/teams/${team.team_id}`}
                                    className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
                                 >
                                    <Avatar className="h-8 w-8">
                                       <AvatarFallback
                                          className="text-white text-xs font-bold"
                                          style={{
                                             backgroundColor:
                                                team.team_color?.toLowerCase() ||
                                                "#6366f1",
                                          }}
                                       >
                                          {team.team_code || "N/A"}
                                       </AvatarFallback>
                                    </Avatar>
                                    <div>
                                       <p className="font-medium">
                                          {team.team_name || "Unknown Team"}
                                       </p>
                                       <p className="text-sm text-gray-500">
                                          {team.team_code || "N/A"}
                                       </p>
                                    </div>
                                 </Link>
                              </td>
                              <td className="py-4 px-2 text-center font-medium">
                                 {safeNumber(team.matches_played)}
                              </td>
                              <td className="py-4 px-2 text-center font-medium text-green-600">
                                 {safeNumber(team.matches_won)}
                              </td>
                              <td className="py-4 px-2 text-center font-medium text-red-600">
                                 {safeNumber(team.matches_lost)}
                              </td>
                              <td className="py-4 px-2 text-center font-medium text-gray-600">
                                 {safeNumber(team.no_results)}
                              </td>
                              <td className="py-4 px-2 text-center">
                                 <Badge variant="outline" className="font-bold">
                                    {safeNumber(team.points)}
                                 </Badge>
                              </td>
                              <td className="py-4 px-2 text-center font-medium">
                                 <span
                                    className={
                                       safeNumber(team.net_run_rate) > 0
                                          ? "text-green-600"
                                          : safeNumber(team.net_run_rate) < 0
                                          ? "text-red-600"
                                          : "text-gray-600"
                                    }
                                 >
                                    {safeNumber(team.net_run_rate) > 0
                                       ? "+"
                                       : ""}
                                    {safeToFixed(team.net_run_rate, 2)}
                                 </span>
                              </td>
                              <td className="py-4 px-2 text-center">
                                 {getPositionBadge(team.position || 0)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {pointsTable.length === 0 && !loading && (
                  <div className="text-center py-8">
                     <p className="text-gray-500">
                        No points table data available for this season
                     </p>
                  </div>
               )}
            </CardContent>
         </Card>

         {/* Playoff Qualification Info */}
         <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
               <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                     <span className="text-sm font-medium">Top 4 Teams</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                     Qualify for Playoffs
                  </p>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                     <span className="text-sm font-medium">
                        5th & 6th Teams
                     </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                     Outside playoff zone
                  </p>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                     <span className="text-sm font-medium">Bottom Teams</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                     Eliminated from playoffs
                  </p>
               </CardContent>
            </Card>
         </div>

         {/* Legend */}
         <Card className="mt-6">
            <CardHeader>
               <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                     <strong>M:</strong> Matches Played
                  </div>
                  <div>
                     <strong>W:</strong> Matches Won
                  </div>
                  <div>
                     <strong>L:</strong> Matches Lost
                  </div>
                  <div>
                     <strong>NR:</strong> No Results
                  </div>
                  <div>
                     <strong>Pts:</strong> Points (2 for win, 1 for no result)
                  </div>
                  <div>
                     <strong>NRR:</strong> Net Run Rate
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

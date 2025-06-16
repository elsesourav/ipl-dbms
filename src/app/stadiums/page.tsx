"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stadium {
   stadium_id: number;
   stadium_name: string;
   city: string;
   state: string;
   capacity: number;
   matches_played: number;
   completion_rate: number;
}

interface StadiumsData {
   stadiums: Stadium[];
}

export default function StadiumsPage() {
   const [data, setData] = useState<StadiumsData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      const fetchStadiums = async () => {
         try {
            const response = await fetch("/api/stadiums");
            if (!response.ok) {
               throw new Error("Failed to fetch stadiums data");
            }
            const stadiumsData = await response.json();
            setData(stadiumsData);
         } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
         } finally {
            setLoading(false);
         }
      };

      fetchStadiums();
   }, []);

   if (loading) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-64">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading stadiums...</p>
               </div>
            </div>
         </div>
      );
   }

   if (error || !data) {
      return (
         <div className="container mx-auto px-4 py-8">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
               <p className="text-gray-600 mb-4">
                  {error || "Failed to load stadiums"}
               </p>
               <Button asChild>
                  <Link href="/">Back to Home</Link>
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-8">
         {/* Header */}
         <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">IPL Stadiums</h1>
            <p className="text-gray-600 text-lg">
               Explore the iconic venues that host the Indian Premier League
               matches
            </p>
         </div>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Total Stadiums
                        </p>
                        <p className="text-2xl font-bold">
                           {data.stadiums.length}
                        </p>
                     </div>
                     <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Total Matches
                        </p>
                        <p className="text-2xl font-bold">
                           {data.stadiums.reduce(
                              (sum, stadium) => sum + stadium.matches_played,
                              0
                           )}
                        </p>
                     </div>
                     <Calendar className="h-8 w-8 text-green-600" />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Total Capacity
                        </p>
                        <p className="text-2xl font-bold">
                           {(
                              data.stadiums.reduce(
                                 (sum, stadium) => sum + stadium.capacity,
                                 0
                              ) / 1000
                           ).toFixed(0)}
                           K
                        </p>
                     </div>
                     <Users className="h-8 w-8 text-purple-600" />
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-sm font-medium text-gray-600">
                           Avg Capacity
                        </p>
                        <p className="text-2xl font-bold">
                           {(
                              data.stadiums.reduce(
                                 (sum, stadium) => sum + stadium.capacity,
                                 0
                              ) /
                              data.stadiums.length /
                              1000
                           ).toFixed(0)}
                           K
                        </p>
                     </div>
                     <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* Stadiums Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.stadiums.map((stadium) => (
               <Card
                  key={stadium.stadium_id}
                  className="hover:shadow-lg transition-shadow"
               >
                  <CardHeader>
                     <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{stadium.stadium_name}</span>
                        <Badge variant="outline">
                           {stadium.matches_played} matches
                        </Badge>
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                           <MapPin className="h-4 w-4 mr-2" />
                           <span>
                              {stadium.city}, {stadium.state}
                           </span>
                        </div>

                        <div className="flex items-center text-gray-600">
                           <Users className="h-4 w-4 mr-2" />
                           <span>
                              {stadium.capacity.toLocaleString()} capacity
                           </span>
                        </div>

                        <div className="flex items-center text-gray-600">
                           <TrendingUp className="h-4 w-4 mr-2" />
                           <span>
                              {(stadium.completion_rate * 100).toFixed(0)}%
                              completion rate
                           </span>
                        </div>

                        <div className="pt-4">
                           <Button asChild className="w-full">
                              <Link href={`/stadiums/${stadium.stadium_id}`}>
                                 View Details
                              </Link>
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>

         {/* Back Button */}
         <div className="mt-8">
            <Button asChild variant="outline">
               <Link href="/">← Back to Home</Link>
            </Button>
         </div>
      </div>
   );
}

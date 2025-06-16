import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { BarChart3, Calendar, Trophy, Users, MapPin } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
         <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
               <div className="flex justify-center items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center cricket-ball">
                     <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                     IPL Database Management System
                  </h1>
               </div>
               <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Comprehensive management system for Indian Premier League
                  teams, players, matches, and statistics
               </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
               <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Teams & Players
                     </CardTitle>
                     <CardDescription>
                        Manage team information, player profiles, and squad
                        details
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Link href="/teams">
                        <Button className="w-full">View Teams</Button>
                     </Link>
                  </CardContent>
               </Card>

               <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Matches
                     </CardTitle>
                     <CardDescription>
                        Schedule matches, record results, and manage fixtures
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Link href="/matches">
                        <Button className="w-full">View Matches</Button>
                     </Link>
                  </CardContent>
               </Card>

               <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Stadiums
                     </CardTitle>
                     <CardDescription>
                        Explore IPL venues, stadium details, and match history
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Link href="/stadiums">
                        <Button className="w-full">View Stadiums</Button>
                     </Link>
                  </CardContent>
               </Card>

               <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Statistics
                     </CardTitle>
                     <CardDescription>
                        Player performance, team standings, and detailed
                        analytics
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Link href="/statistics">
                        <Button className="w-full">View Stats</Button>
                     </Link>
                  </CardContent>
               </Card>

               <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Tournaments
                     </CardTitle>
                     <CardDescription>
                        Manage IPL seasons, series, and tournament structures
                     </CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Link href="/tournaments">
                        <Button className="w-full">View Tournaments</Button>
                     </Link>
                  </CardContent>
               </Card>
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
               <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  IPL at a Glance
               </h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                  <div>
                     <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        8
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        Teams
                     </div>
                  </div>
                  <div>
                     <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        74
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        Matches per Season
                     </div>
                  </div>
                  <div>
                     <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        200+
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        Players
                     </div>
                  </div>
                  <div>
                     <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        17
                     </div>
                     <div className="text-gray-600 dark:text-gray-300">
                        Seasons
                     </div>
                  </div>
               </div>
            </div>

            {/* Login Button */}
            <div className="text-center mt-8">
               <Link href="/auth/signin">
                  <Button size="lg" className="px-8">
                     Login to Admin Panel
                  </Button>
               </Link>
            </div>
         </div>
      </div>
   );
}

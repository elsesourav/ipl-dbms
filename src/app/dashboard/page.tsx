"use client";

// Force dynamic rendering to prevent build errors with useSession
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
   BarChart3,
   Calendar,
   Database,
   Eye,
   LogOut,
   Plus,
   Trophy,
   Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
   const { data: session, status } = useSession();
   const router = useRouter();
   const [stats, setStats] = useState({
      teams: 0,
      players: 0,
      matches: 0,
      completedMatches: 0,
   });
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      if (status === "loading") return;
      if (!session) {
         router.push("/auth/signin");
         return;
      }
      fetchDashboardStats();
   }, [session, status, router]);

   const fetchDashboardStats = async () => {
      try {
         // Fetch basic stats from APIs
         const [teamsRes, playersRes, matchesRes] = await Promise.all([
            fetch("/api/teams"),
            fetch("/api/players"),
            fetch("/api/matches"),
         ]);

         const teams = teamsRes.ok ? await teamsRes.json() : [];
         const players = playersRes.ok ? await playersRes.json() : [];
         const matches = matchesRes.ok ? await matchesRes.json() : [];

         setStats({
            teams: teams.length,
            players: players.length,
            matches: matches.length,
            completedMatches: matches.filter((m: any) => m.is_completed).length,
         });
      } catch (error) {
         console.error("Failed to fetch dashboard stats:", error);
      } finally {
         setLoading(false);
      }
   };

   const handleSignOut = () => {
      signOut({ callbackUrl: "/" });
   };

   if (status === "loading" || !session) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
               <p>Loading dashboard...</p>
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
                     Admin Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                     Welcome back, {session.user?.name}
                  </p>
               </div>
               <div className="flex gap-4">
                  <Badge variant="outline" className="px-3 py-1">
                     {(session.user as any)?.role || "Admin"}
                  </Badge>
                  <Button variant="outline" onClick={handleSignOut}>
                     <LogOut className="w-4 h-4 mr-2" />
                     Sign Out
                  </Button>
               </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Teams
                     </CardTitle>
                     <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{stats.teams}</div>
                     <p className="text-xs text-muted-foreground">
                        IPL franchises
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Total Players
                     </CardTitle>
                     <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{stats.players}</div>
                     <p className="text-xs text-muted-foreground">
                        Registered players
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
                     <div className="text-2xl font-bold">{stats.matches}</div>
                     <p className="text-xs text-muted-foreground">
                        Scheduled matches
                     </p>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">
                        Completed
                     </CardTitle>
                     <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {stats.completedMatches}
                     </div>
                     <p className="text-xs text-muted-foreground">
                        Matches finished
                     </p>
                  </CardContent>
               </Card>
            </div>

            {/* Management Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
               <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="matches">Matches</TabsTrigger>
               </TabsList>

               <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card>
                        <CardHeader>
                           <CardTitle>Quick Actions</CardTitle>
                           <CardDescription>
                              Common administrative tasks
                           </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                           <Button className="w-full justify-start" asChild>
                              <Link href="/admin/teams/add">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Add New Team
                              </Link>
                           </Button>
                           <Button
                              className="w-full justify-start"
                              variant="outline"
                              asChild
                           >
                              <Link href="/admin/players/add">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Add New Player
                              </Link>
                           </Button>
                           <Button
                              className="w-full justify-start"
                              variant="outline"
                              asChild
                           >
                              <Link href="/admin/matches/add">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Schedule Match
                              </Link>
                           </Button>
                           <Button
                              className="w-full justify-start"
                              variant="outline"
                              asChild
                           >
                              <Link href="/admin/database">
                                 <Database className="w-4 h-4 mr-2" />
                                 Database Management
                              </Link>
                           </Button>
                        </CardContent>
                     </Card>

                     <Card>
                        <CardHeader>
                           <CardTitle>System Status</CardTitle>
                           <CardDescription>
                              Current system information
                           </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-sm">Database</span>
                              <Badge className="bg-green-100 text-green-800">
                                 Connected
                              </Badge>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm">API Status</span>
                              <Badge className="bg-green-100 text-green-800">
                                 Online
                              </Badge>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm">Last Updated</span>
                              <span className="text-xs text-gray-500">
                                 Just now
                              </span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-sm">Server Time</span>
                              <span className="text-xs text-gray-500">
                                 {new Date().toLocaleTimeString()}
                              </span>
                           </div>
                        </CardContent>
                     </Card>
                  </div>
               </TabsContent>

               <TabsContent value="teams" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle>Team Management</CardTitle>
                        <CardDescription>
                           Manage IPL teams and their information
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex gap-4">
                           <Button asChild>
                              <Link href="/teams">
                                 <Eye className="w-4 h-4 mr-2" />
                                 View All Teams
                              </Link>
                           </Button>
                           <Button variant="outline" asChild>
                              <Link href="/admin/teams/add">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Add Team
                              </Link>
                           </Button>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                           Total teams: {stats.teams}
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="players" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle>Player Management</CardTitle>
                        <CardDescription>
                           Manage player profiles and statistics
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex gap-4">
                           <Button asChild>
                              <Link href="/players">
                                 <Eye className="w-4 h-4 mr-2" />
                                 View All Players
                              </Link>
                           </Button>
                           <Button variant="outline" asChild>
                              <Link href="/admin/players/add">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Add Player
                              </Link>
                           </Button>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                           Total players: {stats.players}
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="matches" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle>Match Management</CardTitle>
                        <CardDescription>
                           Schedule and manage match fixtures
                        </CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex gap-4">
                           <Button asChild>
                              <Link href="/matches">
                                 <Eye className="w-4 h-4 mr-2" />
                                 View All Matches
                              </Link>
                           </Button>
                           <Button variant="outline" asChild>
                              <Link href="/admin/matches/add">
                                 <Plus className="w-4 h-4 mr-2" />
                                 Schedule Match
                              </Link>
                           </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                           <div>Total matches: {stats.matches}</div>
                           <div>Completed: {stats.completedMatches}</div>
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>

            {/* Recent Activity */}
            <Card className="mt-8">
               <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                     Latest system updates and changes
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-3">
                     <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>System initialized successfully</span>
                        <span className="text-gray-500 ml-auto">Just now</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Database connection established</span>
                        <span className="text-gray-500 ml-auto">1 min ago</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Admin user logged in</span>
                        <span className="text-gray-500 ml-auto">2 min ago</span>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

"use client";

// Force dynamic rendering to prevent build errors with useSession
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Team {
   team_id: number;
   name: string;
}

interface Series {
   series_id: number;
   series_name: string;
}

export default function AddMatchPage() {
   const { data: session } = useSession();
   const router = useRouter();
   const { toast } = useToast();
   const [loading, setLoading] = useState(false);
   const [teams, setTeams] = useState<Team[]>([]);
   const [series, setSeries] = useState<Series[]>([]);
   const [formData, setFormData] = useState({
      team1: "",
      team2: "",
      date: "",
      venue: "",
      match_type: "League",
      series_id: "",
      winner: "",
      toss_winner: "",
      toss_decision: "",
      result_margin: "",
      match_status: "Scheduled",
   });

   useEffect(() => {
      fetchTeams();
      fetchSeries();
   }, []);

   const fetchTeams = async () => {
      try {
         const response = await fetch("/api/teams");
         const result = await response.json();
         if (result.success) {
            setTeams(result.data);
         }
      } catch (error) {
         console.error("Error fetching teams:", error);
      }
   };

   const fetchSeries = async () => {
      try {
         const response = await fetch("/api/tournaments");
         const result = await response.json();
         if (result.success) {
            setSeries(result.data.all || []);
         }
      } catch (error) {
         console.error("Error fetching series:", error);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session) {
         toast({
            title: "Error",
            description: "You must be logged in to add matches",
            variant: "destructive",
         });
         return;
      }

      if (formData.team1 === formData.team2) {
         toast({
            title: "Error",
            description: "Team 1 and Team 2 cannot be the same",
            variant: "destructive",
         });
         return;
      }

      setLoading(true);
      try {
         const response = await fetch("/api/matches", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               ...formData,
               series_id: formData.series_id
                  ? parseInt(formData.series_id)
                  : null,
            }),
         });

         const result = await response.json();

         if (result.success) {
            toast({
               title: "Success",
               description: "Match added successfully",
            });
            router.push("/dashboard");
         } else {
            toast({
               title: "Error",
               description: result.error || "Failed to add match",
               variant: "destructive",
            });
         }
      } catch (error) {
         toast({
            title: "Error",
            description: "An error occurred while adding the match",
            variant: "destructive",
         });
      } finally {
         setLoading(false);
      }
   };

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
   ) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   if (!session) {
      return (
         <div className="min-h-screen flex items-center justify-center">
            <Card className="w-full max-w-md">
               <CardHeader>
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                     You must be logged in to access this page
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <Link href="/auth/signin">
                     <Button className="w-full">Sign In</Button>
                  </Link>
               </CardContent>
            </Card>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
         <div className="max-w-4xl mx-auto">
            <div className="mb-6">
               <Link href="/dashboard">
                  <Button variant="outline" className="mb-4">
                     <ArrowLeft className="h-4 w-4 mr-2" />
                     Back to Dashboard
                  </Button>
               </Link>
               <h1 className="text-3xl font-bold text-gray-900">
                  Add New Match
               </h1>
               <p className="text-gray-600 mt-2">
                  Schedule a new match in the IPL database
               </p>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Match Information</CardTitle>
                  <CardDescription>
                     Fill in the details for the new match
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="team1">Team 1 *</Label>
                           <select
                              id="team1"
                              name="team1"
                              value={formData.team1}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                           >
                              <option value="">Select Team 1</option>
                              {teams.map((team) => (
                                 <option key={team.team_id} value={team.name}>
                                    {team.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="team2">Team 2 *</Label>
                           <select
                              id="team2"
                              name="team2"
                              value={formData.team2}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                           >
                              <option value="">Select Team 2</option>
                              {teams.map((team) => (
                                 <option key={team.team_id} value={team.name}>
                                    {team.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="date">Date *</Label>
                           <Input
                              id="date"
                              name="date"
                              type="datetime-local"
                              value={formData.date}
                              onChange={handleChange}
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="venue">Venue *</Label>
                           <Input
                              id="venue"
                              name="venue"
                              value={formData.venue}
                              onChange={handleChange}
                              placeholder="e.g., Wankhede Stadium, Mumbai"
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="match_type">Match Type</Label>
                           <select
                              id="match_type"
                              name="match_type"
                              value={formData.match_type}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="League">League</option>
                              <option value="Qualifier 1">Qualifier 1</option>
                              <option value="Qualifier 2">Qualifier 2</option>
                              <option value="Eliminator">Eliminator</option>
                              <option value="Final">Final</option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="series_id">Tournament/Series</Label>
                           <select
                              id="series_id"
                              name="series_id"
                              value={formData.series_id}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="">Select Tournament</option>
                              {series.map((s) => (
                                 <option key={s.series_id} value={s.series_id}>
                                    {s.series_name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="toss_winner">Toss Winner</Label>
                           <select
                              id="toss_winner"
                              name="toss_winner"
                              value={formData.toss_winner}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="">Select Toss Winner</option>
                              {formData.team1 && (
                                 <option value={formData.team1}>
                                    {formData.team1}
                                 </option>
                              )}
                              {formData.team2 && (
                                 <option value={formData.team2}>
                                    {formData.team2}
                                 </option>
                              )}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="toss_decision">Toss Decision</Label>
                           <select
                              id="toss_decision"
                              name="toss_decision"
                              value={formData.toss_decision}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="">Select Decision</option>
                              <option value="Bat">Bat</option>
                              <option value="Bowl">Bowl</option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="winner">Winner</Label>
                           <select
                              id="winner"
                              name="winner"
                              value={formData.winner}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="">
                                 Select Winner (if completed)
                              </option>
                              {formData.team1 && (
                                 <option value={formData.team1}>
                                    {formData.team1}
                                 </option>
                              )}
                              {formData.team2 && (
                                 <option value={formData.team2}>
                                    {formData.team2}
                                 </option>
                              )}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="result_margin">Result Margin</Label>
                           <Input
                              id="result_margin"
                              name="result_margin"
                              value={formData.result_margin}
                              onChange={handleChange}
                              placeholder="e.g., 7 wickets, 15 runs"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="match_status">Match Status</Label>
                           <select
                              id="match_status"
                              name="match_status"
                              value={formData.match_status}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="Scheduled">Scheduled</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                           </select>
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                           <Save className="h-4 w-4 mr-2" />
                           {loading ? "Adding..." : "Add Match"}
                        </Button>
                        <Link href="/dashboard">
                           <Button type="button" variant="outline">
                              Cancel
                           </Button>
                        </Link>
                     </div>
                  </form>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}

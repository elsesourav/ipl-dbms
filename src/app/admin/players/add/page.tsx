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

export default function AddPlayerPage() {
   const { data: session } = useSession();
   const router = useRouter();
   const { toast } = useToast();
   const [loading, setLoading] = useState(false);
   const [teams, setTeams] = useState<Team[]>([]);
   const [formData, setFormData] = useState({
      name: "",
      team: "",
      role: "",
      batting_style: "",
      bowling_style: "",
      nationality: "Indian",
      age: "",
      matches_played: "0",
   });

   useEffect(() => {
      fetchTeams();
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

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session) {
         toast({
            title: "Error",
            description: "You must be logged in to add players",
            variant: "destructive",
         });
         return;
      }

      setLoading(true);
      try {
         const response = await fetch("/api/players", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               ...formData,
               age: parseInt(formData.age) || null,
               matches_played: parseInt(formData.matches_played) || 0,
            }),
         });

         const result = await response.json();

         if (result.success) {
            toast({
               title: "Success",
               description: "Player added successfully",
            });
            router.push("/dashboard");
         } else {
            toast({
               title: "Error",
               description: result.error || "Failed to add player",
               variant: "destructive",
            });
         }
      } catch (error) {
         toast({
            title: "Error",
            description: "An error occurred while adding the player",
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
                  Add New Player
               </h1>
               <p className="text-gray-600 mt-2">
                  Add a new player to the IPL database
               </p>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Player Information</CardTitle>
                  <CardDescription>
                     Fill in the details for the new player
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="name">Player Name *</Label>
                           <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="e.g., Virat Kohli"
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="team">Team *</Label>
                           <select
                              id="team"
                              name="team"
                              value={formData.team}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                           >
                              <option value="">Select a team</option>
                              {teams.map((team) => (
                                 <option key={team.team_id} value={team.name}>
                                    {team.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="role">Role</Label>
                           <select
                              id="role"
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="">Select a role</option>
                              <option value="Batsman">Batsman</option>
                              <option value="Bowler">Bowler</option>
                              <option value="All-rounder">All-rounder</option>
                              <option value="Wicket-keeper">
                                 Wicket-keeper
                              </option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="batting_style">Batting Style</Label>
                           <select
                              id="batting_style"
                              name="batting_style"
                              value={formData.batting_style}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                              <option value="">Select batting style</option>
                              <option value="Right-handed">Right-handed</option>
                              <option value="Left-handed">Left-handed</option>
                           </select>
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="bowling_style">Bowling Style</Label>
                           <Input
                              id="bowling_style"
                              name="bowling_style"
                              value={formData.bowling_style}
                              onChange={handleChange}
                              placeholder="e.g., Right-arm fast, Left-arm spin"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="nationality">Nationality</Label>
                           <Input
                              id="nationality"
                              name="nationality"
                              value={formData.nationality}
                              onChange={handleChange}
                              placeholder="e.g., Indian"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="age">Age</Label>
                           <Input
                              id="age"
                              name="age"
                              type="number"
                              value={formData.age}
                              onChange={handleChange}
                              placeholder="e.g., 28"
                              min="16"
                              max="50"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="matches_played">
                              Matches Played
                           </Label>
                           <Input
                              id="matches_played"
                              name="matches_played"
                              type="number"
                              value={formData.matches_played}
                              onChange={handleChange}
                              placeholder="0"
                              min="0"
                           />
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                           <Save className="h-4 w-4 mr-2" />
                           {loading ? "Adding..." : "Add Player"}
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

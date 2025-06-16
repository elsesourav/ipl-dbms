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
import { useState } from "react";

export default function AddTeamPage() {
   const { data: session } = useSession();
   const router = useRouter();
   const { toast } = useToast();
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
      name: "",
      city: "",
      captain: "",
      owner: "",
      home_ground: "",
      coach: "",
   });

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session) {
         toast({
            title: "Error",
            description: "You must be logged in to add teams",
            variant: "destructive",
         });
         return;
      }

      setLoading(true);
      try {
         const response = await fetch("/api/teams", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
         });

         const result = await response.json();

         if (result.success) {
            toast({
               title: "Success",
               description: "Team added successfully",
            });
            router.push("/dashboard");
         } else {
            toast({
               title: "Error",
               description: result.error || "Failed to add team",
               variant: "destructive",
            });
         }
      } catch (error) {
         toast({
            title: "Error",
            description: "An error occurred while adding the team",
            variant: "destructive",
         });
      } finally {
         setLoading(false);
      }
   };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                  Add New Team
               </h1>
               <p className="text-gray-600 mt-2">
                  Create a new team in the IPL database
               </p>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Team Information</CardTitle>
                  <CardDescription>
                     Fill in the details for the new team
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label htmlFor="name">Team Name *</Label>
                           <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="e.g., Mumbai Indians"
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="city">City *</Label>
                           <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              placeholder="e.g., Mumbai"
                              required
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="captain">Captain</Label>
                           <Input
                              id="captain"
                              name="captain"
                              value={formData.captain}
                              onChange={handleChange}
                              placeholder="e.g., Rohit Sharma"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="owner">Owner</Label>
                           <Input
                              id="owner"
                              name="owner"
                              value={formData.owner}
                              onChange={handleChange}
                              placeholder="e.g., Reliance Industries"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="home_ground">Home Ground</Label>
                           <Input
                              id="home_ground"
                              name="home_ground"
                              value={formData.home_ground}
                              onChange={handleChange}
                              placeholder="e.g., Wankhede Stadium"
                           />
                        </div>

                        <div className="space-y-2">
                           <Label htmlFor="coach">Coach</Label>
                           <Input
                              id="coach"
                              name="coach"
                              value={formData.coach}
                              onChange={handleChange}
                              placeholder="e.g., Mahela Jayawardene"
                           />
                        </div>
                     </div>

                     <div className="flex gap-4">
                        <Button type="submit" disabled={loading}>
                           <Save className="h-4 w-4 mr-2" />
                           {loading ? "Adding..." : "Add Team"}
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

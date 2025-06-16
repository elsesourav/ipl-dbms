"use client";

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
import { Trophy } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");
   const router = useRouter();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
         const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
         });

         if (result?.error) {
            setError("Invalid email or password");
         } else {
            router.push("/dashboard");
         }
      } catch (error) {
         setError("An error occurred. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
         <Card className="w-full max-w-md">
            <CardHeader className="text-center">
               <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                     <Trophy className="w-6 h-6 text-white" />
                  </div>
               </div>
               <CardTitle className="text-2xl">Welcome to IPL DBMS</CardTitle>
               <CardDescription>
                  Sign in to access the admin panel
               </CardDescription>
            </CardHeader>
            <CardContent>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="password">Password</Label>
                     <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                  </div>
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                     {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
               </form>

               <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                     Default credentials:
                  </p>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2">
                     Email: admin@ipl.com
                     <br />
                     Password: admin123
                  </p>
               </div>

               <div className="mt-6 text-center">
                  <Link
                     href="/"
                     className="text-sm text-blue-600 hover:underline"
                  >
                     ← Back to Home
                  </Link>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}

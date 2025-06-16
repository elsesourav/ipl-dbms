"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, Trophy, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
   { name: "Home", href: "/" },
   { name: "Teams", href: "/teams" },
   { name: "Players", href: "/players" },
   { name: "Matches", href: "/matches" },
   { name: "Stadiums", href: "/stadiums" },
   { name: "Statistics", href: "/statistics" },
   { name: "Points Table", href: "/points-table" },
   { name: "Tournaments", href: "/tournaments" },
];

export default function Navbar() {
   const pathname = usePathname();
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   return (
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
         <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
               {/* Logo */}
               <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                     <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                     IPL DBMS
                  </span>
               </Link>

               {/* Desktop Navigation */}
               <div className="hidden md:flex items-center space-x-1">
                  {navigation.map((item) => (
                     <Link key={item.name} href={item.href}>
                        <Button
                           variant={
                              pathname === item.href ? "default" : "ghost"
                           }
                           size="sm"
                           className={cn(
                              "text-sm font-medium transition-colors",
                              pathname === item.href
                                 ? "bg-blue-600 text-white hover:bg-blue-700"
                                 : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                           )}
                        >
                           {item.name}
                        </Button>
                     </Link>
                  ))}
               </div>

               {/* Mobile menu button */}
               <div className="md:hidden">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                     {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                     ) : (
                        <Menu className="h-6 w-6" />
                     )}
                  </Button>
               </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
               <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                  <div className="py-2 space-y-1">
                     {navigation.map((item) => (
                        <Link
                           key={item.name}
                           href={item.href}
                           onClick={() => setMobileMenuOpen(false)}
                        >
                           <Button
                              variant={
                                 pathname === item.href ? "default" : "ghost"
                              }
                              size="sm"
                              className={cn(
                                 "w-full justify-start text-sm font-medium",
                                 pathname === item.href
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                              )}
                           >
                              {item.name}
                           </Button>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </nav>
   );
}

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
   title: "IPL Database Management System",
   description:
      "Comprehensive IPL database management system with teams, players, matches, and statistics",
};

export default function RootLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <html lang="en" suppressHydrationWarning>
         <body className={inter.className}>
            <Providers session={null}>
               {children}
               <Toaster />
            </Providers>
         </body>
      </html>
   );
}

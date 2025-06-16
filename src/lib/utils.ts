import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
   return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });
}

export function formatTime(time: string): string {
   return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
   });
}

export function getTeamColor(teamCode: string): string {
   const colors: Record<string, string> = {
      MI: "team-mi",
      CSK: "team-csk",
      RCB: "team-rcb",
      KKR: "team-kkr",
      DC: "team-dc",
      PBKS: "team-pbks",
      RR: "team-rr",
      SRH: "team-srh",
   };
   return colors[teamCode] || "bg-gray-500";
}

export function calculateAge(dateOfBirth: Date | string): number {
   const today = new Date();
   const birth = new Date(dateOfBirth);
   let age = today.getFullYear() - birth.getFullYear();
   const monthDiff = today.getMonth() - birth.getMonth();

   if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
   ) {
      age--;
   }

   return age;
}

export function formatCurrency(amount: number): string {
   return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
   }).format(amount * 10000000); // Convert crores to rupees
}

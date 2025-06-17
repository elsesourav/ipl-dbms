#!/usr/bin/env node

const BASE_URL = "http://localhost:3000/api";

// Focus on the most important routes that should work now
const criticalRoutes = [
   "/teams",
   "/players",
   "/stadiums",
   "/series",
   "/matches",
   "/teams/1",
   "/players/1",
   "/stadiums/1",
   "/series/1",
   "/matches/1",
   "/teams/1/players",
   "/teams/1/stats",
   "/players/1/stats",
   "/matches/1/scorecard",
   "/stats/teams",
   "/stats/players",
   "/points-table",
   "/scorecards/batting",
   "/scorecards/bowling",
];

async function quickTest() {
   console.log("🔥 QUICK CRITICAL ROUTES TEST\n");

   let success = 0;
   let total = 0;

   for (const route of criticalRoutes) {
      try {
         const response = await fetch(`${BASE_URL}${route}`);
         total++;

         if (response.status === 200) {
            success++;
            console.log(`✅ ${route}`);
         } else {
            console.log(`❌ ${route} (${response.status})`);
         }
      } catch (error) {
         total++;
         console.log(`💥 ${route} (${error.message})`);
      }
   }

   console.log(
      `\n📊 RESULT: ${success}/${total} routes working (${Math.round(
         (success / total) * 100
      )}%)`
   );
}

quickTest().catch(console.error);

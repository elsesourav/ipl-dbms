#!/usr/bin/env node

const BASE_URL = "http://localhost:3000/api";

// Complete list of ALL route.ts files to test
const allRoutes = [
   // Basic entity routes
   { path: "/teams", desc: "Get all teams" },
   { path: "/players", desc: "Get all players" },
   { path: "/stadiums", desc: "Get all stadiums" },
   { path: "/series", desc: "Get all series" },
   { path: "/matches", desc: "Get all matches" },
   { path: "/tournaments", desc: "Get all tournaments" },
   { path: "/users", desc: "Get all users" },
   { path: "/contracts", desc: "Get all contracts" },
   { path: "/auctions", desc: "Get all auctions" },

   // Specific entity routes (using ID 1)
   { path: "/teams/1", desc: "Get team by ID" },
   { path: "/players/1", desc: "Get player by ID" },
   { path: "/stadiums/1", desc: "Get stadium by ID" },
   { path: "/series/1", desc: "Get series by ID" },
   { path: "/matches/1", desc: "Get match by ID" },
   { path: "/tournaments/1", desc: "Get tournament by ID" },
   { path: "/users/1", desc: "Get user by ID" },
   { path: "/contracts/1", desc: "Get contract by ID" },

   // Team specific routes
   { path: "/teams/1/players", desc: "Get team players" },
   { path: "/teams/1/matches", desc: "Get team matches" },
   { path: "/teams/1/stats", desc: "Get team stats" },
   { path: "/teams/1/squad/1", desc: "Get team squad for season" },

   // Player specific routes
   { path: "/players/1/stats", desc: "Get player stats" },
   { path: "/players/1/performances", desc: "Get player performances" },
   { path: "/players/1/contracts", desc: "Get player contracts" },
   { path: "/players/1/auction-history", desc: "Get player auction history" },
   { path: "/players/stats", desc: "Get all player stats" },

   // Stadium specific routes
   { path: "/stadiums/1/matches", desc: "Get stadium matches" },

   // Match specific routes
   { path: "/matches/1/scorecard", desc: "Get match scorecard" },
   { path: "/matches/1/squads", desc: "Get match squads" },
   { path: "/matches/1/toss", desc: "Get match toss details" },
   { path: "/matches/1/result", desc: "Get match result" },
   { path: "/matches/1/powerplays", desc: "Get match powerplays" },
   { path: "/matches/1/impact-players", desc: "Get match impact players" },
   { path: "/matches/1/dls", desc: "Get match DLS details" },
   { path: "/matches/1/super-over", desc: "Get match super over" },
   { path: "/matches/1/interruptions", desc: "Get match interruptions" },
   { path: "/matches/1/timeouts", desc: "Get match timeouts" },
   { path: "/matches/1/commentary", desc: "Get match commentary" },
   { path: "/matches/live", desc: "Get live matches" },
   { path: "/matches/upcoming", desc: "Get upcoming matches" },
   { path: "/matches/stats", desc: "Get match statistics" },

   // Stats routes
   { path: "/stats", desc: "Get general stats" },
   { path: "/stats/teams", desc: "Get team stats" },
   { path: "/stats/players", desc: "Get player stats" },
   { path: "/stats/matches", desc: "Get match stats" },
   { path: "/stats/players/batting", desc: "Get batting stats" },
   { path: "/stats/players/bowling", desc: "Get bowling stats" },
   { path: "/stats/players/orange-cap", desc: "Get orange cap stats" },
   { path: "/stats/players/purple-cap", desc: "Get purple cap stats" },

   // Season-specific stats (using season 2023)
   { path: "/stats/teams/by-season/2023", desc: "Get team stats by season" },
   { path: "/stats/teams/1/2023", desc: "Get specific team stats for season" },
   {
      path: "/stats/players/batting/2023",
      desc: "Get batting stats for season",
   },
   {
      path: "/stats/players/bowling/2023",
      desc: "Get bowling stats for season",
   },
   {
      path: "/stats/players/orange-cap/2023",
      desc: "Get orange cap for season",
   },
   {
      path: "/stats/players/purple-cap/2023",
      desc: "Get purple cap for season",
   },
   {
      path: "/stats/matches/highest-scores/2023",
      desc: "Get highest scores for season",
   },
   {
      path: "/stats/matches/closest-wins/2023",
      desc: "Get closest wins for season",
   },
   { path: "/stats/teams/1/head-to-head/2", desc: "Get head-to-head stats" },
   { path: "/stats/venue/1/stats", desc: "Get venue stats" },

   // Points table
   { path: "/points-table", desc: "Get current points table" },
   { path: "/points-table/2023", desc: "Get points table for season" },

   // Scorecards
   { path: "/scorecards", desc: "Get all scorecards" },
   { path: "/scorecards/batting", desc: "Get batting scorecards" },
   { path: "/scorecards/bowling", desc: "Get bowling scorecards" },

   // Search routes
   { path: "/search", desc: "Global search" },
   { path: "/search/global", desc: "Global search endpoint" },
   { path: "/search/teams", desc: "Search teams" },
   { path: "/search/players", desc: "Search players" },
   { path: "/search/matches", desc: "Search matches" },

   // Dashboard routes
   { path: "/dashboard", desc: "Dashboard overview" },
   { path: "/dashboard/overview", desc: "Dashboard overview details" },
   { path: "/dashboard/recent-matches", desc: "Recent matches for dashboard" },
   { path: "/dashboard/upcoming-fixtures", desc: "Upcoming fixtures" },
   { path: "/dashboard/trending-players", desc: "Trending players" },

   // Series routes
   { path: "/series/current", desc: "Get current series" },

   // Contract routes
   { path: "/contracts/by-season", desc: "Get contracts by season" },
   {
      path: "/contracts/by-season/team/1",
      desc: "Get team contracts for season",
   },

   // Auction routes (using season 2023)
   { path: "/auctions/2023", desc: "Get auction for season" },
   { path: "/auctions/2023/players", desc: "Get auction players" },
   { path: "/auctions/2023/bid", desc: "Get auction bids" },

   // Admin routes
   { path: "/admin", desc: "Admin dashboard" },
   { path: "/admin/database-stats", desc: "Database statistics" },
   { path: "/admin/system-health", desc: "System health" },
   { path: "/admin/audit-log", desc: "Audit log" },
   { path: "/admin/backup", desc: "Backup status" },

   // Mobile routes
   { path: "/mobile", desc: "Mobile API overview" },
   { path: "/mobile/live-scores", desc: "Mobile live scores" },
   { path: "/mobile/quick-stats", desc: "Mobile quick stats" },
   { path: "/mobile/notifications", desc: "Mobile notifications" },
   { path: "/mobile/match-center/1", desc: "Mobile match center" },

   // User specific routes
   { path: "/users/1/activity", desc: "Get user activity" },

   // Statistics route
   { path: "/statistics", desc: "Statistics overview" },
];

async function testRoute(route) {
   try {
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}${route.path}`, {
         method: "GET",
         headers: { Accept: "application/json" },
      });
      const endTime = Date.now();
      const duration = endTime - startTime;

      const status = response.status;

      if (status === 200) {
         try {
            const data = await response.json();
            let count = 0;

            if (data.success !== undefined) {
               // Response format: { success: true, data: [...], count: x }
               count =
                  data.count ||
                  (Array.isArray(data.data) ? data.data.length : 1);
            } else if (Array.isArray(data)) {
               count = data.length;
            } else if (typeof data === "object" && data !== null) {
               count = Object.keys(data).length;
            } else {
               count = 1;
            }

            console.log(
               `✅ ${route.path.padEnd(
                  40
               )} - SUCCESS (${count} items, ${duration}ms)`
            );
            return { route: route.path, status: "success", count, duration };
         } catch (jsonError) {
            console.log(
               `⚠️  ${route.path.padEnd(
                  40
               )} - SUCCESS but invalid JSON (${duration}ms)`
            );
            return { route: route.path, status: "success-no-json", duration };
         }
      } else if (status === 404) {
         console.log(`🔍 ${route.path.padEnd(40)} - NOT FOUND (${status})`);
         return { route: route.path, status: "not-found", code: status };
      } else if (status === 500) {
         const errorText = await response.text();
         console.log(`💥 ${route.path.padEnd(40)} - SERVER ERROR (${status})`);
         return {
            route: route.path,
            status: "server-error",
            code: status,
            error: errorText.substring(0, 100),
         };
      } else {
         console.log(`❌ ${route.path.padEnd(40)} - FAILED (${status})`);
         return { route: route.path, status: "error", code: status };
      }
   } catch (error) {
      console.log(
         `💥 ${route.path.padEnd(40)} - NETWORK ERROR: ${error.message}`
      );
      return {
         route: route.path,
         status: "network-error",
         error: error.message,
      };
   }
}

async function runComprehensiveTests() {
   console.log("🚀 COMPREHENSIVE IPL DBMS API TESTING");
   console.log(`📍 Base URL: ${BASE_URL}`);
   console.log(`📋 Testing ${allRoutes.length} routes\n`);

   const results = [];
   let successCount = 0;
   let errorCount = 0;
   let notFoundCount = 0;

   for (let i = 0; i < allRoutes.length; i++) {
      const route = allRoutes[i];
      process.stdout.write(
         `[${(i + 1).toString().padStart(3)}/${allRoutes.length}] `
      );

      const result = await testRoute(route);
      results.push(result);

      if (result.status === "success" || result.status === "success-no-json") {
         successCount++;
      } else if (result.status === "not-found") {
         notFoundCount++;
      } else {
         errorCount++;
      }

      // Small delay between requests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 50));
   }

   console.log("\n" + "=".repeat(80));
   console.log("📊 COMPREHENSIVE TEST RESULTS");
   console.log("=".repeat(80));

   console.log(
      `✅ Successful: ${successCount}/${allRoutes.length} (${(
         (successCount / allRoutes.length) *
         100
      ).toFixed(1)}%)`
   );
   console.log(
      `🔍 Not Found: ${notFoundCount}/${allRoutes.length} (${(
         (notFoundCount / allRoutes.length) *
         100
      ).toFixed(1)}%)`
   );
   console.log(
      `❌ Errors: ${errorCount}/${allRoutes.length} (${(
         (errorCount / allRoutes.length) *
         100
      ).toFixed(1)}%)`
   );

   const errorResults = results.filter(
      (r) =>
         r.status === "server-error" ||
         r.status === "network-error" ||
         r.status === "error"
   );

   if (errorResults.length > 0) {
      console.log("\n❌ ROUTES WITH ERRORS:");
      errorResults.forEach((r) => {
         console.log(`   - ${r.route} (${r.status}: ${r.code || r.error})`);
      });
   }

   const notFoundResults = results.filter((r) => r.status === "not-found");
   if (notFoundResults.length > 0) {
      console.log("\n🔍 ROUTES NOT FOUND (may need implementation):");
      notFoundResults.forEach((r) => {
         console.log(`   - ${r.route}`);
      });
   }

   console.log("\n🎯 Testing completed!");
   console.log("✨ Routes working properly can be used for your application");
}

// Start testing
runComprehensiveTests().catch(console.error);

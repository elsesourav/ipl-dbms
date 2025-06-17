// Comprehensive test of all major API routes
const http = require("http");

function testAPI(endpoint, timeout = 5000) {
   return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:3000${endpoint}`, (res) => {
         let data = "";
         res.on("data", (chunk) => (data += chunk));
         res.on("end", () => {
            try {
               const parsedData = res.headers["content-type"]?.includes(
                  "application/json"
               )
                  ? JSON.parse(data)
                  : data;
               resolve({
                  status: res.statusCode,
                  data: parsedData,
                  headers: res.headers,
                  raw: data,
               });
            } catch (e) {
               resolve({
                  status: res.statusCode,
                  data: data,
                  headers: res.headers,
                  raw: data,
                  parseError: e.message,
               });
            }
         });
      });

      req.on("error", reject);
      req.setTimeout(timeout, () => {
         req.destroy();
         reject(new Error("Request timeout"));
      });
   });
}

async function testEndpoint(endpoint, expectedCount = null) {
   try {
      console.log(`\n🧪 Testing: ${endpoint}`);
      const result = await testAPI(endpoint);

      if (result.status === 200) {
         if (result.data && result.data.success) {
            const count = Array.isArray(result.data.data)
               ? result.data.data.length
               : result.data.count || "unknown";
            console.log(
               `✅ SUCCESS - Status: ${result.status}, Count: ${count}`
            );
            if (expectedCount !== null && count !== expectedCount) {
               console.log(`⚠️  Expected ${expectedCount} items, got ${count}`);
            }
            return { success: true, count, endpoint };
         } else {
            console.log(
               `⚠️  SUCCESS but unexpected format - Status: ${result.status}`
            );
            console.log(
               "Response:",
               JSON.stringify(result.data, null, 2).substring(0, 200)
            );
            return { success: true, count: "unknown", endpoint };
         }
      } else {
         console.log(`❌ FAILED - Status: ${result.status}`);
         console.log("Error:", result.raw.substring(0, 300));
         return {
            success: false,
            status: result.status,
            endpoint,
            error: result.raw.substring(0, 100),
         };
      }
   } catch (error) {
      console.log(`❌ ERROR - ${error.message}`);
      return { success: false, error: error.message, endpoint };
   }
}

async function main() {
   console.log("🚀 Testing all major API routes...\n");

   const endpoints = [
      { path: "/api/teams", expected: 4 },
      { path: "/api/players", expected: null },
      { path: "/api/matches", expected: null },
      { path: "/api/stadiums", expected: null },
      { path: "/api/tournaments", expected: null },
      { path: "/api/points-table", expected: null },
      { path: "/api/statistics", expected: null },
      { path: "/api/debug", expected: null },
      { path: "/api/scorecards", expected: null },
      { path: "/api/stats", expected: null },
   ];

   const results = [];

   for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint.path, endpoint.expected);
      results.push(result);
      // Add a small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
   }

   console.log("\n📊 SUMMARY:");
   console.log("==================");

   const successful = results.filter((r) => r.success);
   const failed = results.filter((r) => !r.success);

   console.log(`✅ Successful: ${successful.length}/${results.length}`);
   console.log(`❌ Failed: ${failed.length}/${results.length}`);

   if (successful.length > 0) {
      console.log("\n✅ Working endpoints:");
      successful.forEach((r) => {
         console.log(`   ${r.endpoint} (${r.count} items)`);
      });
   }

   if (failed.length > 0) {
      console.log("\n❌ Failed endpoints:");
      failed.forEach((r) => {
         console.log(`   ${r.endpoint} - ${r.error || "Status " + r.status}`);
      });
   }

   console.log("\n🎯 Next steps:");
   if (failed.length === 0) {
      console.log("   All major API routes are working! 🎉");
   } else {
      console.log("   Fix the failed endpoints above.");
   }
}

main().catch(console.error);

#!/usr/bin/env node

const BASE_URL = "http://localhost:3000";

async function checkServerHealth() {
   console.log("🔍 Server Health Check");
   console.log("=====================\n");

   // Check if server is responding
   try {
      const response = await fetch(`${BASE_URL}`);
      console.log(`✅ Server responding: ${response.status}`);
   } catch (error) {
      console.log(`❌ Server not responding: ${error.message}`);
      return;
   }

   // Test a simple API route with detailed error handling
   console.log("\n🧪 Testing basic API route...");
   try {
      const response = await fetch(`${BASE_URL}/api/teams`, {
         method: "GET",
         headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
         },
      });

      console.log(`Status: ${response.status}`);
      console.log(
         `Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`
      );

      if (response.status === 200) {
         const data = await response.json();
         console.log(
            `✅ Success! Returned ${
               Array.isArray(data.data) ? data.data.length : "unknown"
            } items`
         );
         console.log(
            `Sample data: ${JSON.stringify(data, null, 2).substring(0, 200)}...`
         );
      } else {
         const errorText = await response.text();
         console.log(`❌ Error Response: ${errorText.substring(0, 500)}`);
      }
   } catch (error) {
      console.log(`💥 Request failed: ${error.message}`);
   }
}

checkServerHealth().catch(console.error);

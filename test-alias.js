// Quick test to check if @ alias works in API routes
const http = require("http");

function testAPI(endpoint) {
   return new Promise((resolve, reject) => {
      const req = http.get(`http://localhost:3000${endpoint}`, (res) => {
         let data = "";
         res.on("data", (chunk) => (data += chunk));
         res.on("end", () => {
            resolve({
               status: res.statusCode,
               data: data,
               headers: res.headers,
            });
         });
      });

      req.on("error", reject);
      req.setTimeout(5000, () => {
         req.destroy();
         reject(new Error("Request timeout"));
      });
   });
}

async function main() {
   try {
      console.log("Testing teams API with @ alias...");
      const result = await testAPI("/api/teams");
      console.log("Status:", result.status);
      console.log("Content-Type:", result.headers["content-type"]);

      if (result.status === 200) {
         console.log("✅ Teams API works with @ alias!");
         const teams = JSON.parse(result.data);
         console.log(`Found ${teams.length} teams`);
         if (teams.length > 0) {
            console.log("Sample team:", teams[0]);
         }
      } else {
         console.log("❌ Teams API failed");
         console.log("Response:", result.data.substring(0, 500));
      }
   } catch (error) {
      console.error("❌ Error testing API:", error.message);
   }
}

main();

import dotenv from "dotenv";
dotenv.config();

async function checkServer() {
   try {
      const res = await fetch("http://127.0.0.1:3000/api/health");
      console.log("Health:", res.status, await res.text());

      const res2 = await fetch("http://127.0.0.1:3000/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // send minimal payload
        body: JSON.stringify({
          id: "349942a4-dbfb-4dfc-abcb-e4ceb5d8de06", // using random uuid
          nama: "Test Server Update"
        })
      });
      console.log("Update API:", res2.status, await res2.text());

   } catch (e) {
      console.error("Fetch failed", e);
   }
}
checkServer();

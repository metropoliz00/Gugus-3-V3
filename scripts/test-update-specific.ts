import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "https://mziqyqkmmmkccawzvojj.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aXF5cWttbW1rY2Nhd3p2b2pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2NDM3NiwiZXhwIjoyMDkzNzQwMzc2fQ.9BNcOFSbnV3_GaJFYIXTSqcFIpqrFjnvmPhWobpwKhQ";

const supabaseAdmin = createClient(url, key);

async function checkUser() {
   const email = "dedysaputra05@guru.sd.belajar.id";
   console.log("Checking user email:", email);
   const { data: users, error } = await supabaseAdmin.from('user_profiles').select('*').eq('email', email);
   
   if (error) {
     console.error(error);
     return;
   }
   
   if (users && users.length > 0) {
      console.log("User:", users[0]);
      
      const payload = {
        id: users[0].id,
        nama: users[0].nama + " (test)",
        email: users[0].email,
        nip: users[0].nip,
        jabatan: users[0].jabatan,
        sekolah: users[0].sekolah,
        kepegawaian: users[0].kepegawaian,
        pangkat: users[0].pangkat,
        foto: users[0].foto || users[0].avatar_url || ""
      };
      
      console.log("Sending payload:", payload);
      
      try {
          const res = await fetch("http://127.0.0.1:3000/api/admin/update-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          console.log("Status:", res.status);
          const txt = await res.text();
          console.log("Response text:", txt);
      } catch(e) {
          console.error("Fetch Exception:", e);
      }
      
   } else {
     console.log("User not found in profiles.");
   }
}

checkUser();

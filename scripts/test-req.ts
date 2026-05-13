import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "https://mziqyqkmmmkccawzvojj.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aXF5cWttbW1rY2Nhd3p2b2pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2NDM3NiwiZXhwIjoyMDkzNzQwMzc2fQ.9BNcOFSbnV3_GaJFYIXTSqcFIpqrFjnvmPhWobpwKhQ";

const supabaseAdmin = createClient(url, key);

async function checkUpdate() {
   const id = "45d50656-ebb9-43ba-a9cd-aa56f5871353"; // a real ID from earlier run
   const reqBody = {
       id,
       nama: "Test Name",
       nip: "123456",
       email: "dedysaputra05@guru.sd.belajar.id"
   };
   
   console.log("Simulating backend logic");
    const { username, email, role, nama, nip, kepegawaian, pangkat, jabatan, sekolah, password, foto } = reqBody as any;
    
    // Update Auth
    const authUpdates: any = {};
    if (email !== undefined) authUpdates.email = email;
    if (password) authUpdates.password = password; // password cannot be empty string
    
    // Auth metadata
    const userMetadata: any = {};
    if (role !== undefined) userMetadata.role = role;
    if (nama !== undefined) userMetadata.nama = nama;
    if (sekolah !== undefined) userMetadata.school = sekolah;
    if (password) userMetadata.password_text = password;
    
    if (Object.keys(userMetadata).length > 0) {
      authUpdates.user_metadata = userMetadata;
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
      if (authError) {
         console.error("Auth Error", authError);
      }
    }
    
    // Update Profile
    const profileUpdates: any = {};
    if (username !== undefined) profileUpdates.username = username;
    if (email !== undefined) profileUpdates.email = email;
    if (role !== undefined) profileUpdates.role = role;
    if (nama !== undefined) profileUpdates.nama = nama;
    if (nip !== undefined) profileUpdates.nip = nip;
    if (kepegawaian !== undefined) profileUpdates.kepegawaian = kepegawaian;
    if (pangkat !== undefined) profileUpdates.pangkat = pangkat;
    if (jabatan !== undefined) profileUpdates.jabatan = jabatan;
    if (sekolah !== undefined) profileUpdates.sekolah = sekolah;
    if (foto !== undefined) profileUpdates.foto = foto;
    if (password) profileUpdates.password_text = password;

    if (Object.keys(profileUpdates).length === 0) {
      console.log("No profile updates");
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', id);
      
    if (profileError && profileError.message.includes('foto')) {
      // Fallback to avatar_url
      console.log("Fallback to avatar_url");
      delete profileUpdates.foto;
      profileUpdates.avatar_url = foto;
      
      const { error: fallbackError } = await supabaseAdmin
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', id);
        
      if (fallbackError) {
        console.error("Profile fallback error", fallbackError);
      }
    } else if (profileError) {
      console.error("Profile Error", profileError);
    }
    
    console.log("Done");
}

checkUpdate();

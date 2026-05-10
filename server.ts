import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Lazy initialization for Supabase Admin client
let _supabaseAdmin: any = null;

function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    const DEFAULT_URL = "https://mziqyqkmmmkccawzvojj.supabase.co";
    const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aXF5cWttbW1rY2Nhd3p2b2pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2NDM3NiwiZXhwIjoyMDkzNzQwMzc2fQ.9BNcOFSbnV3_GaJFYIXTSqcFIpqrFjnvmPhWobpwKhQ";

    let url = process.env.VITE_SUPABASE_URL;
    let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || url === "YOUR_SUPABASE_URL" || url === "" || url.startsWith('eyJ')) {
      url = DEFAULT_URL;
    }

    if (!key || key === "YOUR_SUPABASE_SERVICE_ROLE_KEY" || key === "" || key.length < 50) {
      key = DEFAULT_KEY;
    }
    
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

// API to Create Bulk Users
app.post("/api/v1/bulk-create-users", async (req, res) => {
  console.log(`[BULK V1] POST ${req.url}`);
  const { users } = req.body;

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ error: "Invalid users data" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const results = [];
    const errors = [];

    for (const user of users) {
      try {
        if (!user.username || !user.email) {
          errors.push({ username: user.username || "Unknown", error: "Username and Email are required" });
          continue;
        }

        // Sanitize username for email generation if needed (though email is required here)
        const sanitizedUsername = user.username.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const emailToUse = user.email || `${sanitizedUsername}_${Date.now()}@gugus3melati.local`;

        // Create Auth User
        const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: emailToUse,
          password: user.password || "Gugus3Melati123!", // Default password if not provided
          email_confirm: true,
          user_metadata: {
            username: user.username,
            nama: user.nama || user.username,
            nip: user.nip || "",
            kepegawaian: user.kepegawaian || "",
            pangkat: user.pangkat || "",
            jabatan: user.jabatan || "",
            sekolah: user.sekolah || "",
            role: user.role || 'guru',
            foto: user.foto || "",
            password_text: user.password || "Gugus3Melati123!"
          }
        });

        if (authError) {
          console.error(`[BULK] Auth Error for ${user.username}:`, authError.message);
          errors.push({ username: user.username, error: authError.message });
        } else if (data.user) {
          const userId = data.user.id;
          
          // Upsert Profile
          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .upsert([{
              id: userId,
              username: user.username,
              email: emailToUse,
              role: user.role || 'guru',
              nama: user.nama || user.username,
              sekolah: user.sekolah || "",
              nip: user.nip || "",
              kepegawaian: user.kepegawaian || "",
              pangkat: user.pangkat || "",
              jabatan: user.jabatan || "",
              password_text: user.password || "Gugus3Melati123!",
              foto: user.foto || ""
            }], { onConflict: 'id' });

           if (profileError) {
             console.error(`[BULK] Profile Error for ${user.username}:`, profileError.message);
           }

          results.push({ username: user.username, status: "success" });
        }
      } catch (err: any) {
        console.error(`[BULK] Loop Error for ${user.username}:`, err);
        errors.push({ username: user.username, error: err.message });
      }
    }

    res.json({ results, errors });
  } catch (err: any) {
    console.error("[BULK] Fatal Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route to initialize admin user manually
app.get("/api/debug/init-admin", async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const adminEmail = "admin_master@gugus3.com";
    const adminPassword = "Admin123!";
    const adminUsername = "admin";

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        username: adminUsername,
        nama: "Administrator Utama",
        role: "admin",
        sekolah: "Gugus 3 Melati"
      }
    });

    if (error) {
      console.error("Supabase Full Error:", JSON.stringify(error, null, 2));
      if (error.message.includes("already registered")) {
        return res.json({ message: "Admin sudah terdaftar.", username: adminUsername });
      }
      
      // Attempt manual fix if trigger failed but user MIGHT have been created? 
      // Unlikely if it's a 500, but let's be careful.
      return res.status(500).json({ 
        message: "Gagal membuat user di Supabase Auth (Kemungkinan Trigger Database bermasalah)", 
        error: error.message,
        details: error
      });
    }

    res.json({ message: "Admin berhasil dibuat!", username: adminUsername, password: adminPassword });
  } catch (err: any) {
    res.status(500).json({ 
      error: err.message
    });
  }
});

// Simplified route for user to create admin/guru easily
app.post("/api/v1/create-user", async (req, res) => {
  console.log(`[CREATE V1] POST ${req.url}`);
  const { username, password, role, nama, sekolah, nip, kepegawaian, pangkat, jabatan, foto, email } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role (admin/guru) are required" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Check if username already exists in profiles
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();
    
    if (existingUser) {
      return res.status(400).json({ error: `Username '${username}' sudah terdaftar.` });
    }

    // Sanitize username for email generation
    const sanitizedUsername = username.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const emailToUse = (email && email.trim() !== "") ? email : `${sanitizedUsername}_${Date.now()}@gugus3melati.local`;

    console.log(`[CREATE] Attempting to create user: ${username} with email: ${emailToUse}`);

    // 1. Create Auth User
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password,
      email_confirm: true,
      user_metadata: {
        username: username, // Original username
        nama: nama || username,
        role: role === 'admin' ? 'admin' : 'guru',
        sekolah: sekolah || "",
        nip: nip || "",
        kepegawaian: kepegawaian || "",
        pangkat: pangkat || "",
        jabatan: jabatan || "",
        foto: foto || "",
        password_text: password
      }
    });

    if (error) {
      console.error("[CREATE] Auth Error:", error);
      if (error.message.includes("already registered") || error.message.includes("Email already exists")) {
        return res.status(400).json({ error: `User atau email sudah terdaftar.` });
      }
      throw error;
    }

    if (!data.user) {
      throw new Error("Gagal membuat data user (Auth returned no user)");
    }

    const userId = data.user.id;
    console.log(`[CREATE] Auth User created: ${userId}`);

    // 2. Check if user_profile was created by trigger.
    // Give it a small delay or just try upsert to be safe.
    console.log(`[CREATE] Upserting profile for: ${userId}`);
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert([{
        id: userId,
        username: username,
        email: emailToUse,
        role: role === 'admin' ? 'admin' : 'guru',
        nama: nama || username,
        sekolah: sekolah || "",
        nip: nip || "",
        kepegawaian: kepegawaian || "",
        pangkat: pangkat || "",
        jabatan: jabatan || "",
        password_text: password,
        foto: foto || ""
      }], { onConflict: 'id' });
    
    if (profileError) {
      console.error("[CREATE] Profile Upsert Error:", profileError);
      // If it's a unique violation on username, we should probably tell the user
      if (profileError.message.includes("unique constraint") && profileError.message.includes("username")) {
         return res.status(400).json({ error: `Username '${username}' sudah digunakan.` });
      }
    }

    console.log(`[CREATE] SUCCESS for ${username}`);
    res.json({ 
      message: `User '${username}' berhasil dibuat!`, 
      userId,
      email: emailToUse,
      password 
    });
  } catch (err: any) {
    console.error("[CREATE] Fatal Error:", err);
    res.status(500).json({ 
      error: "Gagal membuat user baru", 
      details: err.message 
    });
  }
});

app.get("/api/debug/list-users", async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // 1. Fetch from Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Fetch from Profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (profileError) throw profileError;

    // Merge data, prefer profile but mix in auth metadata for password/email
    const merged = (profiles || []).map(p => {
       const authUser = authData.users.find(u => u.id === p.id);
       return {
          ...p,
          foto: p.foto || p.avatar_url, // Handle both column names
          password_text: authUser?.user_metadata?.password_text || p.password_text,
          email: authUser?.email || p.email
       };
    });

    res.json(merged);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/v1/update-user", async (req, res) => {
  console.log(`[UPDATE V1] POST ${req.url}`);
  const { id, username, email, role, nama, nip, kepegawaian, pangkat, jabatan, sekolah, password, foto } = req.body;
  
  if (!id) {
    console.error("[UPDATE] Missing user ID in payload:", req.body);
    return res.status(400).json({ error: "User ID is required" });
  }

  console.log(`[UPDATE] Target User ID: ${id}, Username: ${username}`);
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // 0. Check if new username is already taken by someone else
    const { data: nameCheck } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('username', username)
      .neq('id', id)
      .maybeSingle();

    if (nameCheck) {
      return res.status(400).json({ error: `Username '${username}' sudah digunakan oleh user lain.` });
    }

    // 1. Fetch current user data from Auth to check if email changed
    const { data: currentAuthUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(id);
    if (fetchError) {
       console.error("[UPDATE] Error fetching user to check email:", fetchError);
    }
    
    // 1. Update Auth
    const authUpdates: any = {
      user_metadata: { 
        role, 
        nama, 
        sekolah,
        username,
        nip,
        kepegawaian,
        pangkat,
        jabatan,
        foto,
        password_text: password || currentAuthUser?.user?.user_metadata?.password_text
      }
    };
    
    // Only update email if it's provided and DIFFERENT from current email
    if (email && email.trim() !== "" && email !== currentAuthUser?.user?.email) {
      console.log(`[UPDATE] Email changed from ${currentAuthUser?.user?.email} to ${email}`);
      authUpdates.email = email;
      authUpdates.email_confirm = true; // Auto confirm email change if needed
    }
    
    if (password && password.trim() !== "") {
      console.log(`[UPDATE] Updating password for ${username}`);
      authUpdates.password = password;
    }

    console.log(`[UPDATE] Calling supabaseAdmin.auth.admin.updateUserById for ${id}...`);
    const { data: updateResult, error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
    
    if (authError) {
      console.error("[UPDATE] Supabase Auth Error:", JSON.stringify(authError, null, 2));
      return res.status(400).json({ error: `Gagal update Auth: ${authError.message}` });
    }

    console.log("[UPDATE] Auth update success");
    const finalEmail = email || updateResult?.user?.email || currentAuthUser?.user?.email || "";

    // 2. Update Profile
    console.log(`[UPDATE] Updating Profile table for ${id}...`);
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        username,
        email: finalEmail,
        role,
        nama,
        nip,
        kepegawaian,
        pangkat,
        jabatan,
        sekolah,
        foto,
        ...(password ? { password_text: password } : {})
      })
      .eq('id', id);
      
    if (profileError) {
      console.error("[UPDATE] Supabase Profile Error:", JSON.stringify(profileError, null, 2));
      return res.status(400).json({ error: `Gagal update Profile: ${profileError.message}` });
    }
    
    console.log(`[UPDATE] ALL SUCCESS for user: ${username}`);
    return res.status(200).json({ success: true, message: "Update success" });
  } catch (err: any) {
    console.error("[UPDATE] Fatal Exception:", err);
    return res.status(500).json({ 
      error: "Sistem mengalami kendala saat memproses update", 
      message: err?.message || String(err) 
    });
  }
});

app.delete("/api/v1/delete-user/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE V1] DELETE ${req.url}, ID: ${id}`);
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Deleting from Auth will trigger CASCADE on user_profiles
    console.log(`[DELETE] Calling auth.admin.deleteUser for ${id}`);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (error) {
      console.error("[DELETE] Auth Error:", error);
      // Try profile delete if auth fails (e.g. user already deleted from auth but profile remained)
      const { error: profileError } = await supabaseAdmin.from('user_profiles').delete().eq('id', id);
      if (profileError) {
        throw new Error(error.message);
      }
    }
    
    console.log(`[DELETE] SUCCESS for ${id}`);
    res.json({ success: true });
  } catch (err: any) {
    console.error("[DELETE] Fatal Error:", err);
    res.status(500).json({ error: err.message || "Gagal menghapus user" });
  }
});

// Settings API for persisting settings
app.get("/api/settings", async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('site_settings').select('content').eq('id', 1).single();
    if (data && data.content) {
      return res.json({ content: data.content });
    }
    throw new Error('Supabase failed or table missing');
  } catch (err) {
    // Fallback to local file
    try {
      const fileData = fs.readFileSync(path.join(process.cwd(), 'site_settings.json'), 'utf8');
      return res.json({ content: JSON.parse(fileData) });
    } catch (e) {
      return res.json({ content: null });
    }
  }
});

app.post("/api/settings", async (req, res) => {
  const { content } = req.body;
  try {
    fs.writeFileSync(path.join(process.cwd(), 'site_settings.json'), JSON.stringify(content));
    
    // Attempt Supabase
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await supabaseAdmin.from('site_settings').upsert({ id: 1, content });
      
      if (error) {
        console.warn("Supabase Save Warning (Data saved locally only):", error.message);
      }
    } catch (dbErr) {
      console.warn("Supabase connection failed (Data saved locally only):", dbErr);
    }

    // Always succeed if we reach here and fs.writeFileSync didn't throw
    res.json({ success: true });
  } catch (err) {
    console.error("General Save Error:", err);
    return res.status(500).json({ success: false, error: 'General save failed', details: err });
  }
});

// Finance API
app.get("/api/finance/records", async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('finance_transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/finance/records", async (req, res) => {
  const { activity_name, income, expense, date } = req.body;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('finance_transactions')
      .insert([{ activity_name, income, expense, date }])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/finance/records/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from('finance_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', (req, res, next) => {
  // If we reach here, it means no previous API route matched
  console.log(`[API NOT FOUND] ${req.method} ${req.url}`);
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  res.status(404).json({ 
    error: "API Endpoint not found", 
    method: req.method, 
    url: req.url,
    hint: "Check server.ts route definitions" 
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

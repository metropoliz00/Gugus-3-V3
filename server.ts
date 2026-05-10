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

// API to Create Bulk Users (Admin only usually, but we check role or key)
app.post("/api/admin/bulk-create-users", async (req, res) => {
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
        // Create Auth User
        const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password || "Gugus3Melati123!", // Default password if not provided
          email_confirm: true,
          user_metadata: {
            username: user.username,
            nama: user.nama,
            nip: user.nip,
            kepegawaian: user.kepegawaian,
            pangkat: user.pangkat,
            jabatan: user.jabatan,
            sekolah: user.sekolah,
            role: user.role || 'guru',
            password_text: user.password || "Gugus3Melati123!"
          }
        });

        if (authError) {
          errors.push({ username: user.username, error: authError.message });
        } else {
          const userId = data.user.id;
          
          // Check if profile was created by trigger
          const { data: profile } = await supabaseAdmin
            .from('user_profiles')
            .select('id')
            .eq('id', userId)
            .single();

          if (!profile) {
            console.log("Bulk: Trigger profile creation failed, creating manually for user:", userId);
            await supabaseAdmin
              .from('user_profiles')
              .insert([{
                id: userId,
                username: user.username,
                email: user.email,
                role: user.role || 'guru',
                nama: user.nama || user.username,
                sekolah: user.sekolah,
                nip: user.nip,
                kepegawaian: user.kepegawaian,
                pangkat: user.pangkat,
                jabatan: user.jabatan,
                password_text: user.password
              }]);
          }

          results.push({ username: user.username, status: "success" });
        }
      } catch (err: any) {
        errors.push({ username: user.username, error: err.message });
      }
    }

    res.json({ results, errors });
  } catch (err: any) {
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
app.post("/api/setup/create-user", async (req, res) => {
  const { username, password, role, nama, sekolah, nip, kepegawaian, pangkat, jabatan, foto, email } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "Username, password, and role (admin/guru) are required" });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Use provided email or generate a unique dummy email
    const emailToUse = email || `${username.toLowerCase()}_${Date.now()}@gugus3melati.local`;

    // 1. Create Auth User
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        nama: nama || username,
        role: role === 'admin' ? 'admin' : 'guru',
        sekolah,
        nip,
        kepegawaian,
        pangkat,
        jabatan,
        password_text: password
      }
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return res.status(400).json({ error: `User atau email '${username}' sudah terdaftar.` });
      }
      throw error;
    }

    const userId = data.user.id;

    // 2. Check if user_profile was created by trigger. If not, create it manually.
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!profile) {
      console.log("Trigger profile creation failed, creating manually for user:", userId);
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert([{
          id: userId,
          username,
          email: emailToUse,
          role: role === 'admin' ? 'admin' : 'guru',
          nama: nama || username,
          sekolah,
          nip,
          kepegawaian,
          pangkat,
          jabatan,
          password_text: password,
          avatar_url: foto
        }]);
      
      if (profileError) {
        console.error("Manual profile creation error:", profileError);
        // We don't throw here to at least give the user the Auth account, 
        // but it might cause issues later.
      }
    }

    res.json({ 
      message: `User '${username}' berhasil dibuat!`, 
      userId,
      email,
      password // Showing back as requested for verification
    });
  } catch (err: any) {
    console.error("Setup User Error:", err);
    res.status(500).json({ error: err.message, details: err });
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

app.post("/api/admin/update-user", async (req, res) => {
  console.log("[UPDATE] Request received at /api/admin/update-user");
  const { id, username, email, role, nama, nip, kepegawaian, pangkat, jabatan, sekolah, password, foto } = req.body;
  
  if (!id) {
    console.error("[UPDATE] Missing user ID");
    return res.status(400).json({ error: "User ID is required" });
  }

  console.log(`[UPDATE] Target User ID: ${id}, Username: ${username}`);
  
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // 1. Update Auth
    const authUpdates: any = {
      user_metadata: { 
        role, 
        nama, 
        school: sekolah,
        username,
        nip,
        kepegawaian,
        pangkat,
        jabatan,
        password_text: password || undefined
      }
    };
    
    if (email && email.trim() !== "") {
      console.log(`[UPDATE] Setting email to: ${email}`);
      authUpdates.email = email;
    }
    
    if (password) {
      console.log(`[UPDATE] Updating password for ${username}`);
      authUpdates.password = password;
    }

    console.log(`[UPDATE] Calling supabaseAdmin.auth.admin.updateUserById for ${id}...`);
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
    
    if (authError) {
      console.error("[UPDATE] Supabase Auth Error:", JSON.stringify(authError, null, 2));
      return res.status(400).json({ error: `Gagal update Auth: ${authError.message}` });
    }

    console.log("[UPDATE] Auth update success");
    const emailToSave = email || authUser?.user?.email || "";

    // 2. Update Profile
    console.log(`[UPDATE] Updating Profile table for ${id}...`);
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        username,
        email: emailToSave,
        role,
        nama,
        nip,
        kepegawaian,
        pangkat,
        jabatan,
        sekolah,
        avatar_url: foto,
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

app.delete("/api/admin/delete-user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    // Delete from profiles first (referenced)
    await supabaseAdmin.from('user_profiles').delete().eq('id', id);
    // Delete from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    console.error("Delete User Error:", err);
    res.status(500).json({ error: err.message });
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

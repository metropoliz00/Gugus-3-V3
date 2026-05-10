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

    let url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    let key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || url === "YOUR_SUPABASE_URL" || url === "" || url.startsWith('eyJ')) {
      url = DEFAULT_URL;
      console.log(`[CONFIG] Using DEFAULT Supabase URL: ${url}`);
    } else {
      console.log(`[CONFIG] Using CUSTOM Supabase URL: ${url.substring(0, 20)}...`);
    }

    if (!key || key === "YOUR_SUPABASE_SERVICE_ROLE_KEY" || key === "" || key.length < 50) {
      key = DEFAULT_KEY;
      console.log(`[CONFIG] Using DEFAULT Service Role Key`);
    } else {
      console.log(`[CONFIG] Using CUSTOM Service Role Key`);
    }
    
    _supabaseAdmin = createClient(url, key);
  }
  return _supabaseAdmin;
}

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

apiRouter.get("/ping", (req, res) => {
  res.json({ message: "pong", time: new Date().toISOString() });
});

// Route to initialize admin user manually
apiRouter.get("/debug/init-admin", async (req, res) => {
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
      
      return res.status(500).json({ 
        message: "Gagal membuat user di Supabase Auth", 
        error: error.message
      });
    }

    res.json({ message: "Admin berhasil dibuat!", username: adminUsername, password: adminPassword });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/debug/list-users", async (req, res) => {
  console.log(`[LIST] Gathering all users...`);
  try {
    const supabaseAdmin = getSupabaseAdmin();
    let authUsers: any[] = [];
    let authErrorDetails = null;
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        perPage: 1000 
      });
      if (authError) {
        console.error("[LIST] Auth Error details:", authError);
        authErrorDetails = authError;
      } else {
        authUsers = authData.users || [];
        console.log(`[LIST] Auth found ${authUsers.length} users`);
      }
    } catch (e: any) {
      console.error("[LIST] Auth Fetch Exception:", e);
      authErrorDetails = { message: e.message };
    }

    let profilesList: any[] = [];
    let profileErrorDetails = null;
    try {
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*');
      
      if (profileError) {
        console.error("[LIST] Profile Error details:", profileError);
        profileErrorDetails = profileError;
      } else {
        profilesList = profiles || [];
        console.log(`[LIST] Profiles found ${profilesList.length} records`);
      }
    } catch (e: any) {
      console.error("[LIST] Profile Fetch Exception:", e);
      profileErrorDetails = { message: e.message };
    }

    const mergedMap = new Map();
    authUsers.forEach(authUser => {
      const metadata = authUser.user_metadata || {};
      mergedMap.set(authUser.id, {
        id: authUser.id,
        username: p_get_username(authUser, null),
        email: authUser.email || "",
        role: metadata.role || "guru",
        nama: metadata.nama || metadata.full_name || "",
        nip: metadata.nip || "",
        kepegawaian: metadata.kepegawaian || "",
        pangkat: metadata.pangkat || "",
        jabatan: metadata.jabatan || "",
        sekolah: metadata.sekolah || "",
        foto: metadata.foto || metadata.avatar_url || "",
        password_text: metadata.password_text || "",
        created_at: authUser.created_at
      });
    });

    profilesList.forEach(p => {
       const existing = mergedMap.get(p.id) || {};
       mergedMap.set(p.id, {
          ...existing,
          ...p,
          id: p.id || existing.id,
          username: p.username || existing.username || "unknown",
          email: p.email || existing.email || "",
          foto: p.foto || p.avatar_url || existing.foto || ""
       });
    });

    const merged = Array.from(mergedMap.values());
    console.log(`[LIST] Total merged users: ${merged.length}`);
    
    merged.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime() || 0;
      const dateB = new Date(b.created_at || 0).getTime() || 0;
      return dateB - dateA;
    });

    if (req.query.diagnostic === 'true') {
      return res.json({
        count: merged.length,
        authCount: authUsers.length,
        profileCount: profilesList.length,
        authError: authErrorDetails,
        profileError: profileErrorDetails,
        users: merged
      });
    }

    res.json(merged);
  } catch (err: any) {
    console.error("[LIST] Fatal Error:", err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/v1/bulk-create-users", async (req, res) => {
  const { users } = req.body;
  if (!users || !Array.isArray(users)) return res.status(400).json({ error: "Invalid users data" });

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
        const sanitizedUsername = user.username.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const emailToUse = user.email || `${sanitizedUsername}_${Date.now()}@gugus3melati.local`;

        const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: emailToUse,
          password: user.password || "Gugus3Melati123!",
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
          errors.push({ username: user.username, error: authError.message });
        } else if (data.user) {
          await supabaseAdmin.from('user_profiles').upsert([{
            id: data.user.id,
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

apiRouter.post("/v1/create-user", async (req, res) => {
  const { username, password, role, nama, sekolah, nip, kepegawaian, pangkat, jabatan, foto, email } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "Required fields missing" });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingUser } = await supabaseAdmin.from('user_profiles').select('username').eq('username', username).maybeSingle();
    if (existingUser) return res.status(400).json({ error: `Username '${username}' sudah terdaftar.` });

    const sanitizedUsername = username.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const emailToUse = (email && email.trim() !== "") ? email : `${sanitizedUsername}_${Date.now()}@gugus3melati.local`;

    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailToUse,
      password,
      email_confirm: true,
      user_metadata: { username, nama: nama || username, role: role === 'admin' ? 'admin' : 'guru', sekolah, nip, kepegawaian, pangkat, jabatan, foto, password_text: password }
    });

    if (authError) return res.status(400).json({ error: authError.message });
    if (data.user) {
      await supabaseAdmin.from('user_profiles').upsert([{
        id: data.user.id, username, email: emailToUse, role: role === 'admin' ? 'admin' : 'guru', nama: nama || username,
        sekolah, nip, kepegawaian, pangkat, jabatan, password_text: password, foto
      }]);
      res.json({ message: "Success", userId: data.user.id });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/v1/update-user", async (req, res) => {
  const { id, username, email, role, nama, nip, kepegawaian, pangkat, jabatan, sekolah, password, foto } = req.body;
  if (!id) return res.status(400).json({ error: "ID required" });

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: nameCheck } = await supabaseAdmin.from('user_profiles').select('id').eq('username', username).neq('id', id).maybeSingle();
    if (nameCheck) return res.status(400).json({ error: "Username taken" });

    const { data: currentAuthUser } = await supabaseAdmin.auth.admin.getUserById(id);
    const authUpdates: any = {
      user_metadata: { role, nama, sekolah, username, nip, kepegawaian, pangkat, jabatan, foto, password_text: password || currentAuthUser?.user?.user_metadata?.password_text }
    };
    if (email && email !== currentAuthUser?.user?.email) {
      authUpdates.email = email;
      authUpdates.email_confirm = true;
    }
    if (password) authUpdates.password = password;

    const { data: updateResult, error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);
    if (authError) return res.status(400).json({ error: authError.message });

    const finalEmail = email || updateResult?.user?.email || currentAuthUser?.user?.email || "";
    await supabaseAdmin.from('user_profiles').update({
      username, email: finalEmail, role, nama, nip, kepegawaian, pangkat, jabatan, sekolah, foto,
      ...(password ? { password_text: password } : {})
    }).eq('id', id);
    
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete("/v1/delete-user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (error) {
      await supabaseAdmin.from('user_profiles').delete().eq('id', id);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/settings", async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin.from('site_settings').select('content').eq('id', 1).single();
    if (data?.content) return res.json({ content: data.content });
    throw new Error('Fallback');
  } catch {
    try {
      const fileData = fs.readFileSync(path.join(process.cwd(), 'site_settings.json'), 'utf8');
      return res.json({ content: JSON.parse(fileData) });
    } catch {
      return res.json({ content: null });
    }
  }
});

apiRouter.post("/settings", async (req, res) => {
  const { content } = req.body;
  try {
    fs.writeFileSync(path.join(process.cwd(), 'site_settings.json'), JSON.stringify(content));
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from('site_settings').upsert({ id: 1, content });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get("/finance/records", async (req, res) => {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('finance_transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post("/finance/records", async (req, res) => {
  const { activity_name, income, expense, date } = req.body;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('finance_transactions').insert([{ activity_name, income, expense, date }]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete("/finance/records/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('finance_transactions').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.use((req, res) => {
  console.log(`[API 404] ${req.method} ${req.url}`);
  res.status(404).json({ error: "API route not found", path: req.originalUrl });
});

// Mount API router FIRST
app.use("/api", apiRouter);

function p_get_username(authUser: any, profile: any) {
  if (profile?.username) return profile.username;
  if (authUser?.user_metadata?.username) return authUser.user_metadata.username;
  if (authUser?.email) return authUser.email.split('@')[0];
  return "unknown";
}

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

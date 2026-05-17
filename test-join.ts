import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: works, error: worksErr } = await supabase.from("teacher_works").select("*, user_profiles(nama)");
  console.log("Works:", works ? JSON.stringify(works, null, 2) : "no works");
  console.log("Error:", worksErr);
}
run();

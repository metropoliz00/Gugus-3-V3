import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
const cfg = JSON.parse(fs.readFileSync('./src/lib/supabase-config.json', 'utf8'));
const supabase = createClient(cfg.supabaseUrl, cfg.supabaseKey);
async function run() {
  const { data, error } = await supabase.from('site_settings').select('*');
  console.log(data, error);
}
run();

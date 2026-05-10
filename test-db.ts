import { supabase } from './src/lib/supabase';
async function run() {
  const { data, error } = await supabase.from('site_settings').select('*');
  console.log('site_settings:', data);
  if (error) console.error(error);
}
run();

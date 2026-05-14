import { createClient } from '@supabase/supabase-js';

const rawUrl = 'https://mziqyqkmmmkccawzvojj.supabase.co';
const rawAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aXF5cWttbW1rY2Nhd3p2b2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjQzNzYsImV4cCI6MjA5Mzc0MDM3Nn0.tdgWNb7oc6-oMxvIel0yLvQSzujZDoGY6-n4tHY4gno';

const supabase = createClient(rawUrl, rawAnonKey);

async function test() {
  const { data, error } = await supabase.from('awards').select('id, title, description, year').limit(5);
  console.log('Error:', error);
  console.log('Data:', data);
}

test();

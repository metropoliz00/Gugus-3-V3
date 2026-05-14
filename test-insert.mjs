import { createClient } from '@supabase/supabase-js';

const rawUrl = 'https://mziqyqkmmmkccawzvojj.supabase.co';
const rawAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aXF5cWttbW1rY2Nhd3p2b2pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjQzNzYsImV4cCI6MjA5Mzc0MDM3Nn0.tdgWNb7oc6-oMxvIel0yLvQSzujZDoGY6-n4tHY4gno';

const supabase = createClient(rawUrl, rawAnonKey);

async function test() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'dedysaputra05@guru.sd.belajar.id',
    password: 'password'
  });

  const newAward = {
    title: "Penghargaan Baru Test",
    year: new Date().getFullYear(),
    description: JSON.stringify({
      text: "Deskripsi penghargaan...",
      category: "Guru",
      image_url: "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80"
    })
  };

  const { data, error } = await supabase
    .from("awards")
    .insert([newAward])
    .select();

  console.log('Insert Error:', error);
  console.log('Insert Data:', data);
}

test();

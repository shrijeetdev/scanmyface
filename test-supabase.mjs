import { createClient } from '@supabase/supabase-js';

const url = 'https://trjmpsjdawzallpjskbj.supabase.co';
const key = 'sb_publishable_CvZxaZxDhtqozvftnNCOmA_PWMLMNIE';

const supabase = createClient(url, key);

async function testConnection() {
  console.log('Testing Supabase Database Connection...');
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.error('❌ Connection or Table Error:', error.message);
  } else {
    console.log('✅ Connection successful! The `profiles` table exists and is accessible.');
  }
}

testConnection();

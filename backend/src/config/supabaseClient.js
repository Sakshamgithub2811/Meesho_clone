import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`✅ Supabase Client Connected to: ${supabaseUrl}`);
  } catch (error) {
    console.warn('⚠️  Supabase initialization warning:', error.message);
  }
} else {
  console.log('ℹ️  Supabase credentials not configured in .env yet (SUPABASE_URL, SUPABASE_ANON_KEY).');
}

export default supabase;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acwpkfwqkktjuezwbxkt.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_2c9nhS78paiZ5oVKiewAcg_eoBDXQqo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;

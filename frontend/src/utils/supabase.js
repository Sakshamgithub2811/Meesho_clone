import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase.hrgroupco.in';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Cog63mSnnN3QNlVxNPvftt_XFjmviEv';

export const supabase = createClient(supabaseUrl, supabaseKey);

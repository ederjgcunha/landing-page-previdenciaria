const SUPABASE_URL = 'https://zkgbwejwppgeardfewae.supabase.co';
// Using the publishable (anon) key as required for browser usage.
// Ensure you have configured RLS policies in Supabase to allow access.
const SUPABASE_KEY = 'sb_publishable_CfoCVtzINaRW7kg6L7pSuw_oWDfT9YR';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = _supabase;

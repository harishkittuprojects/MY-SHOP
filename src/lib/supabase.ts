import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pqpizcoddnvvmbljautl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxcGl6Y29kZG52dm1ibGphdXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzEwMDgsImV4cCI6MjEwNjAwNzAwOH0.yI8DpOEH6B8Mn9Az9v-whgckgPPAiqVfVYLTTz_JYxw';

// Client for public / standard browser & server operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper to check if Supabase is reachable
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('site_settings').select('key').limit(1);
    return !error;
  } catch {
    return false;
  }
}

export default supabase;

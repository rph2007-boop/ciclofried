import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwiwuoeqncvstliedejq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53aXd1b2VxbmN2c3RsaWVkZWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMzkxMDAsImV4cCI6MjA4NDkxNTEwMH0.RavjqG2K7VBw1nE-jK6-6v_HT07ifx-D5AWXNmkJooA';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};

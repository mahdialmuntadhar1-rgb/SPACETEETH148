import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  'https://hsadukhmcclwixuntqwu.supabase.co';

const SUPABASE_ANON =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYWR1a2htY2Nsd2l4dW50cXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODMzNjgsImV4cCI6MjA4ODY1OTM2OH0.XWDbzIPZNPk6j1GXixcIJKUb4lp48ipC7jExG2Q09Ns';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Fetch only verified city-center businesses
export const getVerifiedBusinesses = async (governorate?: string) => {
  let query = supabase
    .from('businesses')
    .select('id, business_id, name, phone, city, governorate, category, address, contact, location, postcard, verified, verification_status, city_center_only, created_at')
    .eq('verification_status', 'verified')
    .eq('city_center_only', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (governorate) {
    query = query.ilike('city', `%${governorate}%`);
  }

  const { data, error } = await query;
  return { data, error };
};

// Versione browser del client Supabase: usa il localStorage del browser.
// Serve per provare il lato cliente dal computer quando non c'è un secondo telefono.
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && publishableKey);

export const supabase = createClient(url ?? 'https://not-configured.supabase.co', publishableKey ?? 'missing', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

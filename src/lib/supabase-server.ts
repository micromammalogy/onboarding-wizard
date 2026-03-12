import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for use in API routes.
 * Uses the service role key for full access (bypasses RLS).
 * NEVER import this from client components.
 */
export function getSupabaseServer() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

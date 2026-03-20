import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IUserPreferenceCreate } from '@/types/database';

/**
 * GET /api/db/user-preferences — Get user preferences
 * Query params: user_id (required), key (optional — returns single preference if provided)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('user_id');
    if (!userId) {
      return NextResponse.json(
        { error: 'user_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId);

    const key = searchParams.get('key');
    if (key) {
      query = query.eq('preference_key', key);
    }

    const { data, error } = await query;

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB user-preferences] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/db/user-preferences — Upsert a user preference
 * Body: IUserPreferenceCreate
 */
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IUserPreferenceCreate = await request.json();

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(body, {
        onConflict: 'user_id,preference_key',
      })
      .select()
      .single();

    if (error) {
      console.error('[DB user-preferences] Upsert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

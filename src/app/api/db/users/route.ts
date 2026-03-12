import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IUserCreate } from '@/types/database';

/**
 * GET /api/db/users — List users with optional filters
 * Query params: role, email
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    let query = supabase
      .from('users')
      .select('*')
      .order('name', { ascending: true });

    const role = searchParams.get('role');
    if (role) query = query.eq('role', role);

    const email = searchParams.get('email');
    if (email) query = query.eq('email', email);

    const { data, error } = await query;

    if (error) {
      console.error('[DB users] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/users — Create a new user
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IUserCreate = await request.json();

    const { data, error } = await supabase
      .from('users')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB users] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

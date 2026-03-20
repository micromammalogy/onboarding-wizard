import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IStandaloneTaskCreate } from '@/types/database';

/**
 * GET /api/db/standalone-tasks — List standalone tasks for a user
 * Query params: user_id (required)
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

    const { data, error } = await supabase
      .from('standalone_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB standalone-tasks] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/standalone-tasks — Create a standalone task
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IStandaloneTaskCreate = await request.json();

    const { data, error } = await supabase
      .from('standalone_tasks')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB standalone-tasks] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

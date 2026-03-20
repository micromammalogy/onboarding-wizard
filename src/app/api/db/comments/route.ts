import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ICommentCreate } from '@/types/database';

/**
 * GET /api/db/comments — List comments for a task
 * Query params: task_id (required), project_id (optional)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const taskId = searchParams.get('task_id');
    const projectId = searchParams.get('project_id');

    if (!taskId && !projectId) {
      return NextResponse.json(
        { error: 'task_id or project_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (taskId) query = query.eq('task_id', taskId);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB comments] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/comments — Create a comment
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ICommentCreate = await request.json();

    const { data, error } = await supabase
      .from('comments')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB comments] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

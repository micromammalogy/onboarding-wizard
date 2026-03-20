import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/db/activity-log — List activity log entries
 * Query params: project_id or task_id (at least one required)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('project_id');
    const taskId = searchParams.get('task_id');

    if (!projectId && !taskId) {
      return NextResponse.json(
        { error: 'project_id or task_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (taskId) query = query.eq('task_id', taskId);

    const { data, error } = await query;

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB activity-log] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

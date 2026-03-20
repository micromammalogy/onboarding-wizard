import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITaskCreate } from '@/types/database';

/**
 * GET /api/db/tasks — List tasks with optional filters
 * Query params:
 *   project_id — filter by project (required unless `all=true`)
 *   all=true   — return tasks across all projects (for My Work view)
 *   status, assignee_type, assignee_id, section — additional filters
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const isAll = searchParams.get('all') === 'true';
    const projectId = searchParams.get('project_id');

    if (!isAll && !projectId) {
      return NextResponse.json(
        { error: 'project_id query parameter is required (or pass all=true)' },
        { status: 400 },
      );
    }

    // Build different select shapes depending on mode
    const selectClause = isAll
      ? '*, assignee:users!tasks_assignee_id_fkey(id, name, email), project:projects!tasks_project_id_fkey(id, merchant_name, merchant_id, template_id, status)'
      : '*, assignee:users!tasks_assignee_id_fkey(id, name, email)';

    let query = supabase
      .from('tasks')
      .select(selectClause)
      .order('order_index', { ascending: true });

    if (projectId) query = query.eq('project_id', projectId);

    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    const assigneeType = searchParams.get('assignee_type');
    if (assigneeType) query = query.eq('assignee_type', assigneeType);

    const assigneeId = searchParams.get('assignee_id');
    if (assigneeId) query = query.eq('assignee_id', assigneeId);

    const section = searchParams.get('section');
    if (section) query = query.eq('section', section);

    const { data, error } = await query;

    if (error) {
      console.error('[DB tasks] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/tasks — Create a new task
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITaskCreate = await request.json();

    const { data, error } = await supabase
      .from('tasks')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB tasks] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

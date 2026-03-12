import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITaskFieldValueCreate } from '@/types/database';

/**
 * GET /api/db/field-values — Bulk fetch field values by project_id
 * Query params: project_id (required), widget_keys (optional, comma-separated)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('project_id');
    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('task_field_values')
      .select('*')
      .eq('project_id', projectId);

    const widgetKeys = searchParams.get('widget_keys');
    if (widgetKeys) {
      query = query.in('widget_key', widgetKeys.split(','));
    }

    const { data, error } = await query;

    if (error) {
      // Gracefully handle missing table (migration not yet applied)
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB field-values] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/field-values — Bulk create field values
 * Body: array of ITaskFieldValueCreate
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITaskFieldValueCreate[] = await request.json();

    const { data, error } = await supabase
      .from('task_field_values')
      .insert(body)
      .select();

    if (error) {
      console.error('[DB field-values] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/db/automation-logs — List automation log entries
 * Query params: template_id or project_id (at least one required)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const templateId = searchParams.get('template_id');
    const projectId = searchParams.get('project_id');

    if (!templateId && !projectId) {
      return NextResponse.json(
        { error: 'template_id or project_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('automation_logs')
      .select('*')
      .order('executed_at', { ascending: false });

    if (templateId) query = query.eq('template_id', templateId);
    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query;

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB automation-logs] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

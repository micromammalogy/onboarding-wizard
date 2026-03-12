import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITemplateWidgetCreate } from '@/types/database';

/**
 * GET /api/db/template-widgets — List widgets for a template
 * Query params: template_task_id OR template_id (required)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const templateTaskId = searchParams.get('template_task_id');
    const templateId = searchParams.get('template_id');

    if (!templateTaskId && !templateId) {
      return NextResponse.json(
        { error: 'template_task_id or template_id query parameter is required' },
        { status: 400 },
      );
    }

    let query = supabase
      .from('template_widgets')
      .select('*')
      .order('order_index', { ascending: true });

    if (templateTaskId) {
      query = query.eq('template_task_id', templateTaskId);
    } else if (templateId) {
      query = query.eq(
        'template_task_id',
        supabase.from('template_tasks').select('id').eq('template_id', templateId),
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('[DB template-widgets] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/template-widgets — Create widget(s)
 * Body: ITemplateWidgetCreate or ITemplateWidgetCreate[]
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITemplateWidgetCreate | ITemplateWidgetCreate[] = await request.json();

    const { data, error } = await supabase
      .from('template_widgets')
      .insert(Array.isArray(body) ? body : [body])
      .select();

    if (error) {
      console.error('[DB template-widgets] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

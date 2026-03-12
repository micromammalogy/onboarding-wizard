import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITemplateTaskCreate } from '@/types/database';

/**
 * GET /api/db/templates/[id] — Get a template with all its tasks
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('templates')
      .select('*, template_tasks(*)')
      .eq('id', id)
      .single();

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/db/templates/[id] — Update a template (name, description, is_active)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();
    const body: Partial<{ name: string; description: string; is_active: boolean }> =
      await request.json();

    const { data, error } = await supabase
      .from('templates')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[DB templates] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/templates/[id] — Add template tasks to a template
 * Body: { tasks: ITemplateTaskCreate[] }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();
    const { tasks }: { tasks: ITemplateTaskCreate[] } = await request.json();

    const tasksWithTemplateId = tasks.map(t => ({
      ...t,
      template_id: id,
    }));

    const { data, error } = await supabase
      .from('template_tasks')
      .insert(tasksWithTemplateId)
      .select();

    if (error) {
      console.error('[DB templates] Add tasks error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * PUT /api/db/template-tasks/reorder — Bulk update task order_index values
 * Body: { tasks: Array<{ id: string; order_index: number; section?: string }> }
 */
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { tasks }: { tasks: Array<{ id: string; order_index: number; section?: string }> } =
      await request.json();

    const results = await Promise.all(
      tasks.map(t =>
        supabase
          .from('template_tasks')
          .update({ order_index: t.order_index, ...(t.section !== undefined ? { section: t.section } : {}) })
          .eq('id', t.id),
      ),
    );

    const firstError = results.find(r => r.error);
    if (firstError?.error) {
      console.error('[DB template-tasks] Reorder error:', firstError.error.message);
      return NextResponse.json({ error: firstError.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

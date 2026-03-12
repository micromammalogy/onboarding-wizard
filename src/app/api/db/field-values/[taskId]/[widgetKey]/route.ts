import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITaskFieldValueUpdate } from '@/types/database';

/**
 * PUT /api/db/field-values/[taskId]/[widgetKey] — Update a single field value
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskId: string; widgetKey: string }> },
) {
  try {
    const { taskId, widgetKey } = await params;
    const supabase = getSupabaseServer();
    const body: ITaskFieldValueUpdate = await request.json();

    const { data, error } = await supabase
      .from('task_field_values')
      .update(body)
      .eq('task_id', taskId)
      .eq('widget_key', widgetKey)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Field value not found' },
          { status: 404 },
        );
      }
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: null });
      }
      console.error('[DB field-values] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

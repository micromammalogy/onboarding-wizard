import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IStandaloneTaskUpdate } from '@/types/database';

/**
 * PUT /api/db/standalone-tasks/[id] — Update a standalone task
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();
    const body: IStandaloneTaskUpdate = await request.json();

    const { data, error } = await supabase
      .from('standalone_tasks')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[DB standalone-tasks] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/db/standalone-tasks/[id] — Delete a standalone task
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('standalone_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DB standalone-tasks] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

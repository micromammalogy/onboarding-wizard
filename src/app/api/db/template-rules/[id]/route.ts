import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * PUT /api/db/template-rules/[id] — Update a template rule
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();
    const body = await request.json();

    const { data, error } = await supabase
      .from('template_rules')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[DB template-rules] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/db/template-rules/[id] — Delete a template rule
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('template_rules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DB template-rules] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

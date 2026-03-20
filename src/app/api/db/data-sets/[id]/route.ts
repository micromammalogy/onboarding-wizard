import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/db/data-sets/[id] — Get a single data set with its items
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { data: dataSet, error: dsError } = await supabase
      .from('data_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (dsError) {
      const status = dsError.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json({ error: dsError.message }, { status });
    }

    const { data: items, error: itemsError } = await supabase
      .from('data_set_items')
      .select('*')
      .eq('data_set_id', id)
      .order('order_index', { ascending: true });

    if (itemsError) {
      console.error('[DB data-sets] Items fetch error:', itemsError.message);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ data: { ...dataSet, items: items ?? [] } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PUT /api/db/data-sets/[id] — Update a data set
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();
    const body: { name?: string; description?: string } = await request.json();

    const { data, error } = await supabase
      .from('data_sets')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[DB data-sets] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/db/data-sets/[id] — Delete a data set (cascade deletes items)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('data_sets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DB data-sets] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

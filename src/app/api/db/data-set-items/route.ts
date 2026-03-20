import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IDataSetItemCreate } from '@/types/database';

/**
 * POST /api/db/data-set-items — Bulk create data set items
 * Body: IDataSetItemCreate[]
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IDataSetItemCreate | IDataSetItemCreate[] = await request.json();

    const { data, error } = await supabase
      .from('data_set_items')
      .insert(Array.isArray(body) ? body : [body])
      .select();

    if (error) {
      console.error('[DB data-set-items] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

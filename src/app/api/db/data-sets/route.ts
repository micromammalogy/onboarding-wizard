import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IDataSetCreate } from '@/types/database';

/**
 * GET /api/db/data-sets — List all data sets
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('data_sets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB data-sets] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/data-sets — Create a data set
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IDataSetCreate = await request.json();

    const { data, error } = await supabase
      .from('data_sets')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB data-sets] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

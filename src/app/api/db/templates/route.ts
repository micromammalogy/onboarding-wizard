import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITemplateCreate } from '@/types/database';

/**
 * GET /api/db/templates — List active templates
 * Query params: include_inactive (set to "true" to include inactive)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    let query = supabase
      .from('templates')
      .select('*, template_tasks(count)')
      .order('created_at', { ascending: false });

    const includeInactive = searchParams.get('include_inactive');
    if (includeInactive !== 'true') {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[DB templates] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/templates — Create a new template
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITemplateCreate = await request.json();

    const { data, error } = await supabase
      .from('templates')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB templates] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

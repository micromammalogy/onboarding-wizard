import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITemplateRevisionCreate } from '@/types/database';

/**
 * GET /api/db/template-revisions — List revisions for a template
 * Query params: template_id (required)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const templateId = searchParams.get('template_id');
    if (!templateId) {
      return NextResponse.json(
        { error: 'template_id query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('template_revisions')
      .select('*')
      .eq('template_id', templateId)
      .order('revision_number', { ascending: false });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB template-revisions] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/template-revisions — Publish a new template revision
 * Creates a snapshot of the current template state
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITemplateRevisionCreate = await request.json();

    const { data, error } = await supabase
      .from('template_revisions')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB template-revisions] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

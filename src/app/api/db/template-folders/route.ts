import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITemplateFolderCreate } from '@/types/database';

/**
 * GET /api/db/template-folders — List all template folders (tree)
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('template_folders')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB template-folders] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/template-folders — Create a template folder
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITemplateFolderCreate = await request.json();

    const { data, error } = await supabase
      .from('template_folders')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB template-folders] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

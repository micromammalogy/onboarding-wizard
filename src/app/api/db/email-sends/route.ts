import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IEmailSendCreate } from '@/types/database';

/**
 * GET /api/db/email-sends — List email sends
 * Query params: project_id (required)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('project_id');
    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('email_sends')
      .select('*')
      .eq('project_id', projectId)
      .order('sent_at', { ascending: false });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB email-sends] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/email-sends — Record an email send
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IEmailSendCreate = await request.json();

    const { data, error } = await supabase
      .from('email_sends')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB email-sends] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IProjectCreate } from '@/types/database';

/**
 * GET /api/db/projects — List projects with optional filters
 * Query params: ob_rep_id, ae_id, status, merchant_id
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    let query = supabase
      .from('projects')
      .select('*, ae:users!projects_ae_id_fkey(id, name, email), ob_rep:users!projects_ob_rep_id_fkey(id, name, email)')
      .order('created_at', { ascending: false });

    const obRepId = searchParams.get('ob_rep_id');
    if (obRepId) query = query.eq('ob_rep_id', obRepId);

    const aeId = searchParams.get('ae_id');
    if (aeId) query = query.eq('ae_id', aeId);

    const status = searchParams.get('status');
    if (status) query = query.eq('status', status);

    const merchantId = searchParams.get('merchant_id');
    if (merchantId) query = query.eq('merchant_id', merchantId);

    const { data, error } = await query;

    if (error) {
      console.error('[DB projects] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/projects — Create a new project
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IProjectCreate = await request.json();

    const { data, error } = await supabase
      .from('projects')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB projects] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

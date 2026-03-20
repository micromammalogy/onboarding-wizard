import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IWebhookConfigCreate } from '@/types/database';

/**
 * GET /api/db/webhook-configs — List all webhook configs
 */
export async function GET() {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB webhook-configs] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/webhook-configs — Create a webhook config
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: IWebhookConfigCreate = await request.json();

    const { data, error } = await supabase
      .from('webhook_configs')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('[DB webhook-configs] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

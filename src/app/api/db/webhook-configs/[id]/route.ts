import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { IWebhookConfigUpdate } from '@/types/database';

/**
 * PUT /api/db/webhook-configs/[id] — Update a webhook config
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();
    const body: IWebhookConfigUpdate = await request.json();

    const { data, error } = await supabase
      .from('webhook_configs')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[DB webhook-configs] Update error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/db/webhook-configs/[id] — Delete a webhook config (cascade deletes deliveries)
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DB webhook-configs] Delete error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

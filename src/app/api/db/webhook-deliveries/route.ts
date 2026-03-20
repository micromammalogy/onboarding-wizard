import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/db/webhook-deliveries — List webhook deliveries
 * Query params: webhook_config_id (required)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const configId = searchParams.get('webhook_config_id');
    if (!configId) {
      return NextResponse.json(
        { error: 'webhook_config_id query parameter is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_config_id', configId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
        return NextResponse.json({ data: [] });
      }
      console.error('[DB webhook-deliveries] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

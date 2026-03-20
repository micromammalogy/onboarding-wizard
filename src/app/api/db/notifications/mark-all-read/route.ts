import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * PUT /api/db/notifications/mark-all-read — Mark all notifications as read for a user
 * Body: { user_id: string }
 */
export async function PUT(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: { user_id: string } = await request.json();

    if (!body.user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', body.user_id)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('[DB notifications] Mark all read error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, count: data?.length ?? 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

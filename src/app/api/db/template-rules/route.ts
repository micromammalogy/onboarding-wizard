import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import type { ITemplateRuleCreate } from '@/types/database';

/**
 * GET /api/db/template-rules — List rules for a template
 * Query params: template_id (required), rule_type (optional)
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

    let query = supabase
      .from('template_rules')
      .select('*')
      .eq('template_id', templateId);

    const ruleType = searchParams.get('rule_type');
    if (ruleType) {
      query = query.eq('rule_type', ruleType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[DB template-rules] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/db/template-rules — Create rule(s)
 * Body: ITemplateRuleCreate or ITemplateRuleCreate[]
 */
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const body: ITemplateRuleCreate | ITemplateRuleCreate[] = await request.json();

    const { data, error } = await supabase
      .from('template_rules')
      .insert(Array.isArray(body) ? body : [body])
      .select();

    if (error) {
      console.error('[DB template-rules] Create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

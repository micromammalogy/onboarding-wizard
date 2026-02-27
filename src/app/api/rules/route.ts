import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';
import { RULES_QUERY } from '@/graphql/queries/rules';
import { RULE_CREATE } from '@/graphql/mutations/rules';

/**
 * GET /api/rules?context=SHIPMENT_RATING_BUFFER&first=20&after=cursor
 * Lists rules with optional context filter.
 */
export async function GET(request: Request) {
  const organizationId = request.headers.get('x-organization-id') || '';
  const merchantToken = request.headers.get('x-merchant-token') || undefined;
  const credentialToken = request.headers.get('x-credential-token') || undefined;

  const { searchParams } = new URL(request.url);
  const context = searchParams.get('context') || undefined;
  const first = parseInt(searchParams.get('first') || '20', 10);
  const after = searchParams.get('after') || undefined;

  const filter: Record<string, unknown> = {};
  if (context) filter.context = context;

  try {
    const { data, errors } = await gqlServerRequest({
      schema: 'internal',
      query: RULES_QUERY,
      variables: { filter, first, after },
      organizationId,
      merchantToken,
      credentialToken,
    });

    if (errors.length > 0) {
      return NextResponse.json({ data, errors }, { status: 200 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { errors: [{ message: `Rules list error: ${message}` }] },
      { status: 502 },
    );
  }
}

/**
 * POST /api/rules
 * Creates a new rule.
 * Body: { input: RuleCreateInput }
 */
export async function POST(request: Request) {
  const organizationId = request.headers.get('x-organization-id') || '';
  const merchantToken = request.headers.get('x-merchant-token') || undefined;
  const credentialToken = request.headers.get('x-credential-token') || undefined;

  let body: { input?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ message: 'Invalid JSON in request body' }] },
      { status: 400 },
    );
  }

  if (!body.input) {
    return NextResponse.json(
      { errors: [{ message: 'Missing input in request body' }] },
      { status: 400 },
    );
  }

  try {
    const { data, errors } = await gqlServerRequest({
      schema: 'internal',
      query: RULE_CREATE,
      variables: { input: body.input },
      organizationId,
      merchantToken,
      credentialToken,
    });

    if (errors.length > 0) {
      return NextResponse.json({ data, errors }, { status: 200 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { errors: [{ message: `Rule create error: ${message}` }] },
      { status: 502 },
    );
  }
}

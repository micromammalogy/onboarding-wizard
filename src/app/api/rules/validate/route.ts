import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';
import { RULE_VALIDATE } from '@/graphql/mutations/rules';

/**
 * POST /api/rules/validate
 * Validates a rule expression before saving.
 * Body: { input: RuleValidateInput }
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
      query: RULE_VALIDATE,
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
      { errors: [{ message: `Rule validate error: ${message}` }] },
      { status: 502 },
    );
  }
}

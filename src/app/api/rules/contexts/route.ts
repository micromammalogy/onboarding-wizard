import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';
import { RULE_CONTEXTS_QUERY } from '@/graphql/queries/rules';

/**
 * GET /api/rules/contexts
 * Fetches all rule contexts with their typed variables.
 */
export async function GET(request: Request) {
  const organizationId = request.headers.get('x-organization-id') || '';
  const merchantToken = request.headers.get('x-merchant-token') || undefined;
  const credentialToken = request.headers.get('x-credential-token') || undefined;

  try {
    const { data, errors } = await gqlServerRequest({
      schema: 'internal',
      query: RULE_CONTEXTS_QUERY,
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
      { errors: [{ message: `Rules contexts error: ${message}` }] },
      { status: 502 },
    );
  }
}

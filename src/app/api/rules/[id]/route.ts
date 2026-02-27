import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';
import { RULE_UPDATE, RULE_ARCHIVE } from '@/graphql/mutations/rules';

/**
 * PUT /api/rules/[id]
 * Updates an existing rule.
 * Body: { input: RuleUpdateInput } (id is injected from URL)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const input = { ...body.input, id };

  try {
    const { data, errors } = await gqlServerRequest({
      schema: 'internal',
      query: RULE_UPDATE,
      variables: { input },
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
      { errors: [{ message: `Rule update error: ${message}` }] },
      { status: 502 },
    );
  }
}

/**
 * DELETE /api/rules/[id]
 * Archives (soft-deletes) a rule.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const organizationId = request.headers.get('x-organization-id') || '';
  const merchantToken = request.headers.get('x-merchant-token') || undefined;
  const credentialToken = request.headers.get('x-credential-token') || undefined;

  try {
    const { data, errors } = await gqlServerRequest({
      schema: 'internal',
      query: RULE_ARCHIVE,
      variables: { id },
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
      { errors: [{ message: `Rule archive error: ${message}` }] },
      { status: 502 },
    );
  }
}

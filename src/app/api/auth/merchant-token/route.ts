import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';

const GET_PUBLIC_CREDENTIAL = `
  mutation getPublicCredential($organization: ID!) {
    getPublicCredential(organization: $organization) {
      id
      mode
      organization
      type
    }
  }
`;

type IGetPublicCredentialResponse = {
  getPublicCredential: {
    id: string;
    mode: string;
    organization: string;
    type: string;
  };
};

/**
 * Fetches the merchant's public credential token via the auth schema.
 * Client sends { organizationId }, server returns { merchantToken }.
 */
export async function POST(request: Request) {
  let body: { organizationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 },
    );
  }

  const { organizationId } = body;
  if (!organizationId) {
    return NextResponse.json(
      { error: 'Missing organizationId' },
      { status: 400 },
    );
  }

  try {
    const { data, errors } = await gqlServerRequest<IGetPublicCredentialResponse>({
      schema: 'auth',
      query: GET_PUBLIC_CREDENTIAL,
      variables: { organization: organizationId },
      organizationId,
    });

    if (errors.length > 0) {
      console.error('[merchant-token] GraphQL errors:', JSON.stringify(errors));
      const message = (errors[0] as { message?: string })?.message || 'Failed to get merchant token';
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const merchantToken = data.getPublicCredential?.id;
    if (!merchantToken) {
      return NextResponse.json(
        { error: 'No public credential found for this organization' },
        { status: 404 },
      );
    }

    return NextResponse.json({ merchantToken });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[merchant-token] Server error:', message);
    return NextResponse.json(
      { error: `Failed to fetch merchant token: ${message}` },
      { status: 502 },
    );
  }
}

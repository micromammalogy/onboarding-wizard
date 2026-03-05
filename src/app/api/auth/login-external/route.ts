import { NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';
import { env } from '@/lib/env';

const LOGIN_EXTERNAL = `
  mutation loginExternal($input: LoginExternalInput!) {
    loginExternal(input: $input) {
      credential
      organization
      mode
    }
  }
`;

/**
 * Exchange the user's credential token for an org-scoped credential session.
 * This mirrors the real dashboard's loginExternal flow.
 */
export async function POST(request: Request) {
  let body: { organizationId?: string; credentialToken?: string; storeId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { organizationId, credentialToken, storeId } = body;
  if (!organizationId || !credentialToken) {
    return NextResponse.json(
      { error: 'Missing organizationId or credentialToken' },
      { status: 400 },
    );
  }

  const client = new GraphQLClient(env.AUTH_GRAPH_URL, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      credentialToken: credentialToken,
      senderCredential: env.AUTH_GRAPH_TOKEN,
    },
  });

  try {
    const data = await client.request<{
      loginExternal: {
        credential: string;
        organization: string;
        mode: string;
      };
    }>(LOGIN_EXTERNAL, {
      input: {
        organizationId,
        token: credentialToken,
        mode: 'LIVE',
        ...(storeId && { storeId }),
      },
    });

    return NextResponse.json({
      credential: data.loginExternal.credential,
      organization: data.loginExternal.organization,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[login-external] Error:', message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

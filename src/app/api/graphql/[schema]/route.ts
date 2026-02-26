import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';
import type { IGraphQLSchema } from '@/lib/env';

const VALID_SCHEMAS: IGraphQLSchema[] = [
  'internal',
  'viewport',
  'auth',
  'frontend',
  'internal-ups',
];

/**
 * GraphQL proxy route.
 * Client sends { query, variables } to /api/graphql/{schema}
 * Server proxies to the correct Zonos endpoint with proper auth.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ schema: string }> },
) {
  const { schema } = await params;

  if (!VALID_SCHEMAS.includes(schema as IGraphQLSchema)) {
    return NextResponse.json(
      { errors: [{ message: `Invalid schema: ${schema}` }] },
      { status: 400 },
    );
  }

  // Check required env vars exist before making request
  const envCheck = checkEnvVars(schema as IGraphQLSchema);
  if (envCheck) {
    return NextResponse.json(
      { errors: [{ message: envCheck }] },
      { status: 503 },
    );
  }

  const organizationId =
    request.headers.get('x-organization-id') || '';
  const merchantToken =
    request.headers.get('x-merchant-token') || undefined;
  const credentialToken =
    request.headers.get('x-credential-token') || undefined;

  let body: { query?: string; variables?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: [{ message: 'Invalid JSON in request body' }] },
      { status: 400 },
    );
  }

  const { query, variables } = body;

  if (!query) {
    return NextResponse.json(
      { errors: [{ message: 'Missing query in request body' }] },
      { status: 400 },
    );
  }

  try {
    const { data, errors } = await gqlServerRequest({
      schema: schema as IGraphQLSchema,
      query,
      variables,
      organizationId,
      merchantToken,
      credentialToken,
    });

    if (errors.length > 0) {
      console.error(`[GraphQL ${schema}] Errors:`, JSON.stringify(errors));
      return NextResponse.json({ data, errors }, { status: 200 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[GraphQL ${schema}] Server error:`, message);
    return NextResponse.json(
      { errors: [{ message: `GraphQL proxy error: ${message}` }] },
      { status: 502 },
    );
  }
}

function checkEnvVars(schema: IGraphQLSchema): string | null {
  const envMap: Record<string, string> = {
    internal: 'INTERNAL_GRAPH_URL',
    viewport: 'VIEWPORT_GRAPH_URL',
    auth: 'AUTH_GRAPH_URL',
    frontend: 'FRONTEND_GRAPH_URL',
    'internal-ups': 'INTERNAL_UPS_GRAPH_URL',
  };

  const urlVar = envMap[schema];
  if (urlVar && !process.env[urlVar]) {
    return `Missing environment variable: ${urlVar}. Add it to .env.local with the Zonos GraphQL endpoint URL.`;
  }

  // Check auth tokens needed per schema
  if (schema === 'viewport' && !process.env.VIEWPORT_GRAPH_ADMIN_SECRET) {
    return 'Missing environment variable: VIEWPORT_GRAPH_ADMIN_SECRET';
  }
  if (schema === 'frontend' && !process.env.FRONTEND_GRAPH_ADMIN_SECRET) {
    return 'Missing environment variable: FRONTEND_GRAPH_ADMIN_SECRET';
  }
  if (schema === 'auth' && !process.env.AUTH_GRAPH_TOKEN) {
    return 'Missing environment variable: AUTH_GRAPH_TOKEN';
  }

  return null;
}

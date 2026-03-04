import { NextResponse } from 'next/server';
import { gqlServerRequest } from '@/lib/graphql/client';

const ORGANIZATION_QUERY = `
  query getOrganization {
    organization {
      id
      name
      website
      party {
        location {
          line1
          line2
          locality
          administrativeAreaCode
          postalCode
          countryCode
        }
      }
    }
  }
`;

/**
 * Fetches org details using the service token + org ID header.
 * The `organization` (singular) query returns the org scoped to x-organization-id.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing organization ID' }, { status: 400 });
  }

  const { data, errors } = await gqlServerRequest({
    schema: 'internal',
    query: ORGANIZATION_QUERY,
    organizationId: id,
    // No merchantToken → falls back to INTERNAL_GRAPH_TOKEN (service/admin token)
  });

  if (errors.length > 0) {
    console.error('[Org Detail] GraphQL errors:', JSON.stringify(errors));
  }

  const org = (data as { organization?: unknown }).organization ?? null;
  return NextResponse.json({ organization: org });
}

import { NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';
import { env } from '@/lib/env';

const ORGANIZATIONS_QUERY = `
  query organizations($filter: OrganizationFilter, $first: Int) {
    organizations(filter: $filter, first: $first) {
      edges {
        node {
          id
          name
          status
          references { companyId storeId }
        }
      }
    }
  }
`;

/**
 * Server-side org search using INTERNAL_GRAPH_TOKEN.
 * No user credential needed — uses the service token.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';

  if (!search.trim()) {
    return NextResponse.json({ organizations: [] });
  }

  const client = new GraphQLClient(env.INTERNAL_GRAPH_URL, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      credentialtoken: env.INTERNAL_GRAPH_TOKEN,
    },
  });

  try {
    const data = await client.request<{
      organizations: {
        edges: {
          node: {
            id: string;
            name: string;
            status: string;
            references: { companyId: string; storeId: number };
          };
        }[];
      };
    }>(ORGANIZATIONS_QUERY, {
      filter: {
        search: search.trim(),
        requireStoreId: true,
      },
      first: 10,
    });

    const organizations = data.organizations.edges.map(e => e.node);
    return NextResponse.json({ organizations });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Org Search] Error:', message);
    return NextResponse.json(
      { error: 'Failed to search organizations', organizations: [] },
      { status: 502 },
    );
  }
}

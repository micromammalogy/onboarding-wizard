import type { IGraphQLSchema, IGraphQLProxyResponse } from '@/types/graphql';

type IFetcherParams = {
  schema: IGraphQLSchema;
  query: string;
  variables?: Record<string, unknown>;
  organizationId: string;
  merchantToken?: string;
  credentialToken?: string;
  authCredential?: string;
};

/**
 * Client-side GraphQL fetcher.
 * Posts to /api/graphql/{schema} which proxies to the real Zonos endpoint.
 * Sends merchant token + credential token for dual-header auth.
 */
export async function graphqlFetcher<T = Record<string, unknown>>(
  params: IFetcherParams,
): Promise<IGraphQLProxyResponse<T>> {
  const { schema, query, variables, organizationId, merchantToken, credentialToken, authCredential } = params;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-organization-id': organizationId,
  };
  if (merchantToken) {
    headers['x-merchant-token'] = merchantToken;
  }
  if (credentialToken) {
    headers['x-credential-token'] = credentialToken;
  }
  if (authCredential) {
    headers['x-auth-credential'] = authCredential;
  }

  const response = await fetch(`/api/graphql/${schema}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  let json: IGraphQLProxyResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  if (json.errors?.length) {
    const message = json.errors.map(e => e.message).join('; ');
    throw new Error(message);
  }

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  return json;
}

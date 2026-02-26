import { GraphQLClient } from 'graphql-request';
import { getGraphQLUrl, type IGraphQLSchema } from '@/lib/env';
import { getHeadersForSchema } from './headers';

type IGqlServerRequestParams = {
  schema: IGraphQLSchema;
  query: string;
  variables?: Record<string, unknown>;
  organizationId: string;
  merchantToken?: string;
  credentialToken?: string;
};

/**
 * Server-side GraphQL request.
 * Routes to the correct Zonos endpoint and injects proper auth headers.
 */
export async function gqlServerRequest<T = Record<string, unknown>>({
  schema,
  query,
  variables,
  organizationId,
  merchantToken,
  credentialToken,
}: IGqlServerRequestParams): Promise<{ data: T; errors: unknown[] }> {
  const url = getGraphQLUrl(schema);
  const headers = getHeadersForSchema(schema, {
    organizationId,
    merchantToken,
    credentialToken,
  });

  const client = new GraphQLClient(url, { headers });

  try {
    const data = await client.request<T>(query, variables);
    return { data, errors: [] };
  } catch (error: unknown) {
    const gqlError = error as { response?: { errors?: unknown[] } };
    return {
      data: {} as T,
      errors: gqlError?.response?.errors || [{ message: String(error) }],
    };
  }
}

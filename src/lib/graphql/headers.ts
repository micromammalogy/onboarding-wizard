import { env } from '@/lib/env';
import type { IGraphQLSchema } from '@/types/graphql';

type IAuthContext = {
  organizationId: string;
  merchantToken?: string;
  credentialToken?: string;
  authCredential?: string;
};

/**
 * Build the correct auth headers for each GraphQL schema.
 * For internal schemas: merchantToken as credentialtoken, user token as credentialtokenproxy.
 */
export function getHeadersForSchema(
  schema: IGraphQLSchema,
  auth: IAuthContext,
): Record<string, string> {
  const base: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  switch (schema) {
    case 'internal':
    case 'internal-ups': {
      const headers: Record<string, string> = {
        ...base,
        credentialtoken: auth.merchantToken || env.INTERNAL_GRAPH_TOKEN,
        'x-organization-id': auth.organizationId,
      };
      if (auth.credentialToken) {
        headers['credentialtokenproxy'] = auth.credentialToken;
      }
      return headers;
    }

    case 'viewport':
      return {
        ...base,
        'x-hasura-admin-secret': env.VIEWPORT_GRAPH_ADMIN_SECRET,
        'x-organization-id': auth.organizationId,
      };

    case 'auth':
      return {
        ...base,
        credentialtoken: auth.authCredential || auth.credentialToken || env.INTERNAL_GRAPH_TOKEN,
        senderCredential: env.AUTH_GRAPH_TOKEN,
      };

    case 'frontend':
      return {
        ...base,
        'x-hasura-admin-secret': env.FRONTEND_GRAPH_ADMIN_SECRET,
      };

    default:
      return base;
  }
}

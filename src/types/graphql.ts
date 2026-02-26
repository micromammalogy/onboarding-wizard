/**
 * Core GraphQL types shared across the application.
 */

export type IGraphQLSchema =
  | 'internal'
  | 'viewport'
  | 'auth'
  | 'frontend'
  | 'internal-ups';

/** Request body sent from client to /api/graphql/[schema] */
export type IGraphQLProxyRequest = {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

/** Response from GraphQL endpoints */
export type IGraphQLProxyResponse<T = Record<string, unknown>> = {
  data?: T;
  errors?: IGraphQLError[];
};

export type IGraphQLError = {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
};

/** Cursor-based pagination (Relay style) */
export type IPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
};

export type IEdge<T> = {
  node: T;
  cursor: string;
};

export type IConnection<T> = {
  edges: IEdge<T>[];
  pageInfo: IPageInfo;
  totalCount: number;
};

/** Auth session stored client-side */
export type ICredentialSession = {
  credentialToken: string;
  organizationId: string;
  merchantToken: string;
};

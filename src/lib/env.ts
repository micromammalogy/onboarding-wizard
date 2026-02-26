/**
 * Type-safe server-only environment variable access.
 * Uses getters for lazy evaluation (doesn't throw at import time during build).
 *
 * Env var names match the real dashboard (INTERNAL_GRAPH_URL, etc.)
 * but prefixed with ZONOS_ to avoid collisions.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // GraphQL endpoints
  get INTERNAL_GRAPH_URL() {
    return requireEnv('INTERNAL_GRAPH_URL');
  },
  get VIEWPORT_GRAPH_URL() {
    return requireEnv('VIEWPORT_GRAPH_URL');
  },
  get AUTH_GRAPH_URL() {
    return requireEnv('AUTH_GRAPH_URL');
  },
  get FRONTEND_GRAPH_URL() {
    return requireEnv('FRONTEND_GRAPH_URL');
  },
  get INTERNAL_UPS_GRAPH_URL() {
    return process.env['INTERNAL_UPS_GRAPH_URL'] || '';
  },

  // Auth tokens
  get AUTH_GRAPH_TOKEN() {
    return requireEnv('AUTH_GRAPH_TOKEN');
  },
  get INTERNAL_GRAPH_TOKEN() {
    return requireEnv('INTERNAL_GRAPH_TOKEN');
  },
  get FRONTEND_GRAPH_ADMIN_SECRET() {
    return requireEnv('FRONTEND_GRAPH_ADMIN_SECRET');
  },
  get VIEWPORT_GRAPH_ADMIN_SECRET() {
    return requireEnv('VIEWPORT_GRAPH_ADMIN_SECRET');
  },
} as const;

export type IGraphQLSchema =
  | 'internal'
  | 'viewport'
  | 'auth'
  | 'frontend'
  | 'internal-ups';

export function getGraphQLUrl(schema: IGraphQLSchema): string {
  switch (schema) {
    case 'internal':
      return env.INTERNAL_GRAPH_URL;
    case 'viewport':
      return env.VIEWPORT_GRAPH_URL;
    case 'auth':
      return env.AUTH_GRAPH_URL;
    case 'frontend':
      return env.FRONTEND_GRAPH_URL;
    case 'internal-ups':
      return env.INTERNAL_UPS_GRAPH_URL;
    default:
      throw new Error(`Unknown GraphQL schema: ${schema}`);
  }
}

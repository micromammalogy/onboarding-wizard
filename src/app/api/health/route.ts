import { NextResponse } from 'next/server';

const REQUIRED_VARS = [
  'INTERNAL_GRAPH_URL',
  'INTERNAL_GRAPH_TOKEN',
  'VIEWPORT_GRAPH_URL',
  'VIEWPORT_GRAPH_ADMIN_SECRET',
  'AUTH_GRAPH_URL',
  'AUTH_GRAPH_TOKEN',
  'FRONTEND_GRAPH_URL',
  'FRONTEND_GRAPH_ADMIN_SECRET',
] as const;

/** GET /api/health — check which env vars are set (without exposing values). */
export async function GET() {
  const vars: Record<string, boolean> = {};
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    const present = !!process.env[key];
    vars[key] = present;
    if (!present) missing.push(key);
  }

  const ok = missing.length === 0;

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'missing_env_vars',
      vars,
      ...(missing.length > 0 && { missing }),
    },
    { status: ok ? 200 : 503 },
  );
}

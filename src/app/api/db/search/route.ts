import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * GET /api/db/search — Global search across projects, templates, and tasks
 * Query params: q (required, search query string)
 */
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('q');
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'q query parameter is required' },
        { status: 400 },
      );
    }

    const searchTerm = `%${query.trim()}%`;

    // Search projects by merchant_name or merchant_id
    const projectsPromise = supabase
      .from('projects')
      .select('id, merchant_name, merchant_id, status, created_at')
      .or(`merchant_name.ilike.${searchTerm},merchant_id.ilike.${searchTerm}`)
      .order('created_at', { ascending: false })
      .limit(10);

    // Search templates by name
    const templatesPromise = supabase
      .from('templates')
      .select('id, name, description, is_active, created_at')
      .ilike('name', searchTerm)
      .order('created_at', { ascending: false })
      .limit(10);

    // Search tasks by title
    const tasksPromise = supabase
      .from('tasks')
      .select('id, title, project_id, status, assignee_type, created_at')
      .ilike('title', searchTerm)
      .order('created_at', { ascending: false })
      .limit(10);

    const [projectsResult, templatesResult, tasksResult] = await Promise.all([
      projectsPromise,
      templatesPromise,
      tasksPromise,
    ]);

    // Handle table-not-found gracefully for each
    const projects = projectsResult.error ? [] : projectsResult.data ?? [];
    const templates = templatesResult.error ? [] : templatesResult.data ?? [];
    const tasks = tasksResult.error ? [] : tasksResult.data ?? [];

    return NextResponse.json({
      data: {
        projects,
        templates,
        tasks,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

/**
 * POST /api/db/projects/[id]/instantiate — Create tasks + empty field values from template
 * Body: { template_id: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const supabase = getSupabaseServer();
    const { template_id: templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'template_id is required in request body' },
        { status: 400 },
      );
    }

    // 1. Fetch template tasks
    const { data: templateTasks, error: ttError } = await supabase
      .from('template_tasks')
      .select('*')
      .eq('template_id', templateId)
      .order('order_index', { ascending: true });

    if (ttError) {
      return NextResponse.json({ error: ttError.message }, { status: 500 });
    }

    if (!templateTasks || templateTasks.length === 0) {
      return NextResponse.json(
        { error: 'No template tasks found for this template' },
        { status: 404 },
      );
    }

    // 2. Create tasks from template tasks
    const tasksToInsert = templateTasks.map(tt => ({
      project_id: projectId,
      template_task_id: tt.id,
      title: tt.title,
      description: tt.description,
      section: tt.section,
      order_index: tt.order_index,
      assignee_type: tt.assignee_type,
      due_date_type: tt.due_date_type,
      due_date_offset_days: tt.due_date_offset_days,
      task_type: tt.task_type,
      metadata: tt.metadata,
      is_stop_gate: tt.is_stop_gate,
      is_visible: !tt.hidden_by_default,
      status: 'pending',
    }));

    const { data: createdTasks, error: taskError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (taskError) {
      return NextResponse.json({ error: taskError.message }, { status: 500 });
    }

    // 3. Build mapping: template_task_id -> created task id
    const taskMapping = new Map<string, string>();
    for (const task of createdTasks) {
      if (task.template_task_id) {
        taskMapping.set(task.template_task_id, task.id);
      }
    }

    // 4. Fetch template widgets for all template tasks
    const templateTaskIds = templateTasks.map(tt => tt.id);
    const { data: widgets, error: widgetError } = await supabase
      .from('template_widgets')
      .select('*')
      .in('template_task_id', templateTaskIds);

    if (widgetError) {
      return NextResponse.json({ error: widgetError.message }, { status: 500 });
    }

    // 5. Create empty field values for all form widgets with keys
    if (widgets && widgets.length > 0) {
      const fieldValuesToInsert = widgets
        .filter((w: { key: string | null }) => w.key)
        .map((w: { template_task_id: string; key: string }) => {
          const taskId = taskMapping.get(w.template_task_id);
          return {
            task_id: taskId,
            project_id: projectId,
            widget_key: w.key,
            value_text: null,
            value_date: null,
            value_json: null,
            value_select: null,
          };
        })
        .filter((fv: { task_id: string | undefined }) => fv.task_id);

      if (fieldValuesToInsert.length > 0) {
        const { error: fvError } = await supabase
          .from('task_field_values')
          .insert(fieldValuesToInsert);

        if (fvError) {
          console.error('[DB instantiate] Field values error:', fvError.message);
        }
      }
    }

    // 6. Update project with template_id
    await supabase
      .from('projects')
      .update({ template_id: templateId, status: 'in_progress' })
      .eq('id', projectId);

    return NextResponse.json({
      data: {
        tasks_created: createdTasks.length,
        field_values_created: widgets?.filter((w: { key: string | null }) => w.key).length ?? 0,
      },
    }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

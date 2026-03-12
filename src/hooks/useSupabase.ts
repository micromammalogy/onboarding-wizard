import useSWR, { type KeyedMutator } from 'swr';
import type {
  IProject,
  ITask,
  IUser,
  IProjectUpdate,
  ITaskUpdate,
  ITaskFieldValue,
  ITemplateWidget,
  ITemplateRule,
} from '@/types/database';

// --- Fetcher ---

async function dbFetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

async function dbMutate<T>(
  url: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
}

// --- Projects ---

type IProjectWithRelations = IProject & {
  ae: Pick<IUser, 'id' | 'name' | 'email'> | null;
  ob_rep: Pick<IUser, 'id' | 'name' | 'email'> | null;
};

type IUseProjectsParams = {
  ob_rep_id?: string;
  ae_id?: string;
  status?: string;
  skip?: boolean;
};

export function useProjects(params: IUseProjectsParams = {}) {
  const { skip = false, ...filters } = params;
  const search = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) search.set(k, v);
  });
  const qs = search.toString();
  const url = `/api/db/projects${qs ? `?${qs}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<IProjectWithRelations[]>(
    skip ? null : url,
    () => dbFetcher<IProjectWithRelations[]>(url),
    { revalidateOnFocus: false },
  );

  return { projects: data ?? [], error, isLoading, mutate };
}

type IUseProjectReturn = {
  project: IProjectWithRelations | null;
  error: Error | undefined;
  isLoading: boolean;
  mutate: KeyedMutator<IProjectWithRelations>;
  updateProject: (updates: IProjectUpdate) => Promise<IProject>;
};

export function useProject(id: string | null): IUseProjectReturn {
  const url = id ? `/api/db/projects/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<IProjectWithRelations>(
    url,
    () => dbFetcher<IProjectWithRelations>(url!),
    { revalidateOnFocus: false },
  );

  const updateProject = async (updates: IProjectUpdate) => {
    const result = await dbMutate<IProject>(`/api/db/projects/${id}`, 'PUT', updates);
    mutate();
    return result;
  };

  return {
    project: data ?? null,
    error,
    isLoading,
    mutate,
    updateProject,
  };
}

// --- Tasks ---

type ITaskWithRelations = ITask & {
  assignee: Pick<IUser, 'id' | 'name' | 'email'> | null;
};

export function useTasks(projectId: string | null) {
  const url = projectId ? `/api/db/tasks?project_id=${projectId}` : null;

  const { data, error, isLoading, mutate } = useSWR<ITaskWithRelations[]>(
    url,
    () => dbFetcher<ITaskWithRelations[]>(url!),
    { revalidateOnFocus: false },
  );

  const updateTask = async (taskId: string, updates: ITaskUpdate) => {
    const result = await dbMutate<ITask>(`/api/db/tasks/${taskId}`, 'PUT', updates);
    mutate();
    return result;
  };

  const createTask = async (task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await dbMutate<ITask>('/api/db/tasks', 'POST', task);
    mutate();
    return result;
  };

  const deleteTask = async (taskId: string) => {
    await dbMutate<void>(`/api/db/tasks/${taskId}`, 'DELETE');
    mutate();
  };

  return {
    tasks: data ?? [],
    error,
    isLoading,
    mutate,
    updateTask,
    createTask,
    deleteTask,
  };
}

// --- Field Values ---

export function useFieldValuesData(projectId: string | null) {
  const url = projectId ? `/api/db/field-values?project_id=${projectId}` : null;

  const { data, error, isLoading, mutate } = useSWR<ITaskFieldValue[]>(
    url,
    () => dbFetcher<ITaskFieldValue[]>(url!),
    { revalidateOnFocus: false },
  );

  return { fieldValues: data ?? [], error, isLoading, mutate };
}

// --- Template Widgets ---

export function useTemplateWidgets(templateTaskId: string | null) {
  const url = templateTaskId
    ? `/api/db/template-widgets?template_task_id=${templateTaskId}`
    : null;

  const { data, error, isLoading } = useSWR<ITemplateWidget[]>(
    url,
    () => dbFetcher<ITemplateWidget[]>(url!),
    { revalidateOnFocus: false },
  );

  return { widgets: data ?? [], error, isLoading };
}

export function useAllTemplateWidgets(templateId: string | null) {
  const url = templateId
    ? `/api/db/template-widgets?template_id=${templateId}`
    : null;

  const { data, error, isLoading } = useSWR<ITemplateWidget[]>(
    url,
    () => dbFetcher<ITemplateWidget[]>(url!),
    { revalidateOnFocus: false },
  );

  return { widgets: data ?? [], error, isLoading };
}

// --- Template Rules ---

export function useTemplateRules(templateId: string | null) {
  const url = templateId
    ? `/api/db/template-rules?template_id=${templateId}`
    : null;

  const { data, error, isLoading } = useSWR<ITemplateRule[]>(
    url,
    () => dbFetcher<ITemplateRule[]>(url!),
    { revalidateOnFocus: false },
  );

  return { rules: data ?? [], error, isLoading };
}

// --- Users ---

export function useUsers(role?: string) {
  const url = role ? `/api/db/users?role=${role}` : '/api/db/users';

  const { data, error, isLoading } = useSWR<IUser[]>(
    url,
    () => dbFetcher<IUser[]>(url),
    { revalidateOnFocus: false },
  );

  return { users: data ?? [], error, isLoading };
}

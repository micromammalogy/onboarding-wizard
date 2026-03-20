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
  IComment,
  ICommentCreate,
  INotification,
  IActivityLog,
  IStandaloneTask,
  IStandaloneTaskCreate,
  IStandaloneTaskUpdate,
  IDataSet,
  IDataSetItem,
} from '@/types/database';

// Stable empty array to prevent infinite re-render loops when SWR errors
// (data ?? [] creates a new reference each render, breaking useMemo/useEffect deps)
const EMPTY_ARRAY: never[] = [];

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

  return { projects: data ?? EMPTY_ARRAY, error, isLoading, mutate };
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
    tasks: data ?? EMPTY_ARRAY,
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
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return { fieldValues: data ?? EMPTY_ARRAY, error, isLoading: !error && isLoading, mutate };
}

// --- Template Widgets ---

export function useTemplateWidgets(templateTaskId: string | null) {
  const url = templateTaskId
    ? `/api/db/template-widgets?template_task_id=${templateTaskId}`
    : null;

  const { data, error, isLoading } = useSWR<ITemplateWidget[]>(
    url,
    () => dbFetcher<ITemplateWidget[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return { widgets: data ?? EMPTY_ARRAY, error, isLoading: !error && isLoading };
}

export function useAllTemplateWidgets(templateId: string | null) {
  const url = templateId
    ? `/api/db/template-widgets?template_id=${templateId}`
    : null;

  const { data, error, isLoading } = useSWR<ITemplateWidget[]>(
    url,
    () => dbFetcher<ITemplateWidget[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return { widgets: data ?? EMPTY_ARRAY, error, isLoading: !error && isLoading };
}

// --- Template Rules ---

export function useTemplateRules(templateId: string | null) {
  const url = templateId
    ? `/api/db/template-rules?template_id=${templateId}`
    : null;

  const { data, error, isLoading } = useSWR<ITemplateRule[]>(
    url,
    () => dbFetcher<ITemplateRule[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return { rules: data ?? EMPTY_ARRAY, error, isLoading: !error && isLoading };
}

// --- All User Tasks (My Work) ---

type IMyWorkTask = ITask & {
  assignee: Pick<IUser, 'id' | 'name' | 'email'> | null;
  project: Pick<IProject, 'id' | 'merchant_name' | 'merchant_id' | 'template_id' | 'status'> | null;
};

export function useAllUserTasks(params: { assignee_id?: string; skip?: boolean } = {}) {
  const { skip = false, assignee_id } = params;
  const search = new URLSearchParams();
  search.set('all', 'true');
  if (assignee_id) search.set('assignee_id', assignee_id);
  const url = `/api/db/tasks?${search.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<IMyWorkTask[]>(
    skip ? null : url,
    () => dbFetcher<IMyWorkTask[]>(url),
    { revalidateOnFocus: false },
  );

  const updateTask = async (taskId: string, updates: ITaskUpdate) => {
    const result = await dbMutate<ITask>(`/api/db/tasks/${taskId}`, 'PUT', updates);
    mutate();
    return result;
  };

  return {
    tasks: data ?? EMPTY_ARRAY,
    error,
    isLoading,
    mutate,
    updateTask,
  };
}

// --- Users ---

export function useUsers(role?: string) {
  const url = role ? `/api/db/users?role=${role}` : '/api/db/users';

  const { data, error, isLoading } = useSWR<IUser[]>(
    url,
    () => dbFetcher<IUser[]>(url),
    { revalidateOnFocus: false },
  );

  return { users: data ?? EMPTY_ARRAY, error, isLoading };
}

// --- Comments ---

export function useComments(taskId: string | null) {
  const url = taskId ? `/api/db/comments?task_id=${taskId}` : null;

  const { data, error, isLoading, mutate } = useSWR<IComment[]>(
    url,
    () => dbFetcher<IComment[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const createComment = async (comment: ICommentCreate) => {
    const result = await dbMutate<IComment>('/api/db/comments', 'POST', comment);
    mutate();
    return result;
  };

  const deleteComment = async (commentId: string) => {
    await dbMutate<void>(`/api/db/comments/${commentId}`, 'DELETE');
    mutate();
  };

  return {
    comments: data ?? EMPTY_ARRAY,
    error,
    isLoading: !error && isLoading,
    mutate,
    createComment,
    deleteComment,
  };
}

// --- Notifications ---

export function useNotifications(userId: string | null) {
  const url = userId ? `/api/db/notifications?user_id=${userId}` : null;

  const { data, error, isLoading, mutate } = useSWR<INotification[]>(
    url,
    () => dbFetcher<INotification[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const markRead = async (notificationId: string) => {
    await dbMutate<INotification>(
      `/api/db/notifications/${notificationId}`,
      'PUT',
      { is_read: true },
    );
    mutate();
  };

  const markAllRead = async () => {
    if (!userId) return;
    await dbMutate<unknown>(
      '/api/db/notifications/mark-all-read',
      'PUT',
      { user_id: userId },
    );
    mutate();
  };

  const unreadCount = (data ?? []).filter(n => !n.is_read).length;

  return {
    notifications: data ?? EMPTY_ARRAY,
    unreadCount,
    error,
    isLoading: !error && isLoading,
    mutate,
    markRead,
    markAllRead,
  };
}

// --- Activity Log ---

type IActivityLogParams = {
  projectId?: string;
  taskId?: string;
};

export function useActivityLog(params: IActivityLogParams) {
  const { projectId, taskId } = params;
  const search = new URLSearchParams();
  if (projectId) search.set('project_id', projectId);
  if (taskId) search.set('task_id', taskId);
  const qs = search.toString();
  const url = qs ? `/api/db/activity-log?${qs}` : null;

  const { data, error, isLoading } = useSWR<IActivityLog[]>(
    url,
    () => dbFetcher<IActivityLog[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return {
    activityLog: data ?? EMPTY_ARRAY,
    error,
    isLoading: !error && isLoading,
  };
}

// --- Standalone Tasks ---

export function useStandaloneTasks(userId: string | null) {
  const url = userId ? `/api/db/standalone-tasks?user_id=${userId}` : null;

  const { data, error, isLoading, mutate } = useSWR<IStandaloneTask[]>(
    url,
    () => dbFetcher<IStandaloneTask[]>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const createTask = async (task: IStandaloneTaskCreate) => {
    const result = await dbMutate<IStandaloneTask>(
      '/api/db/standalone-tasks',
      'POST',
      task,
    );
    mutate();
    return result;
  };

  const updateTask = async (taskId: string, updates: IStandaloneTaskUpdate) => {
    const result = await dbMutate<IStandaloneTask>(
      `/api/db/standalone-tasks/${taskId}`,
      'PUT',
      updates,
    );
    mutate();
    return result;
  };

  const deleteTask = async (taskId: string) => {
    await dbMutate<void>(`/api/db/standalone-tasks/${taskId}`, 'DELETE');
    mutate();
  };

  return {
    standaloneTasks: data ?? EMPTY_ARRAY,
    error,
    isLoading: !error && isLoading,
    mutate,
    createTask,
    updateTask,
    deleteTask,
  };
}

// --- Data Sets ---

export function useDataSets() {
  const url = '/api/db/data-sets';

  const { data, error, isLoading, mutate } = useSWR<IDataSet[]>(
    url,
    () => dbFetcher<IDataSet[]>(url),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return {
    dataSets: data ?? EMPTY_ARRAY,
    error,
    isLoading: !error && isLoading,
    mutate,
  };
}

type IDataSetWithItems = IDataSet & { items: IDataSetItem[] };

export function useDataSet(id: string | null) {
  const url = id ? `/api/db/data-sets/${id}` : null;

  const { data, error, isLoading, mutate } = useSWR<IDataSetWithItems>(
    url,
    () => dbFetcher<IDataSetWithItems>(url!),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return {
    dataSet: data ?? null,
    error,
    isLoading: !error && isLoading,
    mutate,
  };
}

// --- Search ---

type ISearchResults = {
  projects: Array<Pick<IProject, 'id' | 'merchant_name' | 'merchant_id' | 'status' | 'created_at'>>;
  templates: Array<{ id: string; name: string; description: string | null; is_active: boolean; created_at: string }>;
  tasks: Array<Pick<ITask, 'id' | 'title' | 'project_id' | 'status' | 'assignee_type' | 'created_at'>>;
};

export function useSearch(query: string) {
  // Debounce: only fetch when query has 2+ characters
  const trimmed = query.trim();
  const url = trimmed.length >= 2 ? `/api/db/search?q=${encodeURIComponent(trimmed)}` : null;

  const { data, error, isLoading } = useSWR<ISearchResults>(
    url,
    () => dbFetcher<ISearchResults>(url!),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 300,
    },
  );

  const emptyResults: ISearchResults = { projects: [], templates: [], tasks: [] };

  return {
    results: data ?? emptyResults,
    error,
    isLoading: !error && isLoading,
  };
}

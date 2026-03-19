import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ITaskId =
  | 'platform'
  | 'general'
  | 'team'
  | 'billing'
  | 'catalog';

export type ITask = {
  id: ITaskId;
  label: string;
  page: string;
};

export const ONBOARDING_TASKS: ITask[] = [
  { id: 'platform', label: 'Select e-commerce platform', page: '' },
  { id: 'general', label: 'Fill out account details', page: 'general-settings' },
  { id: 'team', label: 'Add team members', page: 'team' },
  { id: 'billing', label: 'Complete billing details', page: 'billing' },
  { id: 'catalog', label: 'Confirm catalog defaults', page: 'catalog' },
];

// Sequential order for "Next step" pagination
export const TASK_ORDER: ITaskId[] = ['platform', 'general', 'team', 'billing', 'catalog'];

type ITaskState = {
  completedTasks: Partial<Record<ITaskId, boolean>>;
  onboardingDismissed: boolean;
  markComplete: (id: ITaskId) => void;
  markIncomplete: (id: ITaskId) => void;
  isComplete: (id: ITaskId) => boolean;
  completedCount: () => number;
  dismissOnboarding: () => void;
  resetTasks: () => void;
};

export const useTaskStore = create<ITaskState>()(
  persist(
    (set, get) => ({
      completedTasks: {},
      onboardingDismissed: false,
      markComplete: (id: ITaskId) =>
        set(s => ({ completedTasks: { ...s.completedTasks, [id]: true } })),
      markIncomplete: (id: ITaskId) =>
        set(s => ({ completedTasks: { ...s.completedTasks, [id]: false } })),
      isComplete: (id: ITaskId) => !!get().completedTasks[id],
      completedCount: () =>
        Object.values(get().completedTasks).filter(Boolean).length,
      dismissOnboarding: () => set({ onboardingDismissed: true }),
      resetTasks: () => set({ completedTasks: {}, onboardingDismissed: false }),
    }),
    { name: 'zonos-onboarding-tasks' },
  ),
);

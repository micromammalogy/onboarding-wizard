import { create } from 'zustand';

type IOnboardingView = 'my-work' | 'project-list' | 'project-detail' | 'template-list' | 'reports' | 'data-sets';

type IOnboardingNavState = {
  view: IOnboardingView;
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  setView: (view: IOnboardingView) => void;
  openMyWork: () => void;
  openProject: (projectId: string) => void;
  selectTask: (taskId: string | null) => void;
  backToList: () => void;
  openTemplates: () => void;
  openReports: () => void;
  openDataSets: () => void;
};

export const useOnboardingNavStore = create<IOnboardingNavState>(set => ({
  view: 'my-work',
  selectedProjectId: null,
  selectedTaskId: null,
  setView: view => set({ view }),
  openMyWork: () => set({ view: 'my-work', selectedProjectId: null, selectedTaskId: null }),
  openProject: projectId =>
    set({ view: 'project-detail', selectedProjectId: projectId, selectedTaskId: null }),
  selectTask: taskId => set({ selectedTaskId: taskId }),
  backToList: () => set({ view: 'project-list', selectedProjectId: null, selectedTaskId: null }),
  openTemplates: () => set({ view: 'template-list', selectedProjectId: null, selectedTaskId: null }),
  openReports: () => set({ view: 'reports', selectedProjectId: null, selectedTaskId: null }),
  openDataSets: () => set({ view: 'data-sets', selectedProjectId: null, selectedTaskId: null }),
}));

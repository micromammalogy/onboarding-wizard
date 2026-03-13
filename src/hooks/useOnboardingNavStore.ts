import { create } from 'zustand';

type IOnboardingView = 'project-list' | 'project-detail' | 'template-list' | 'reports';

type IOnboardingNavState = {
  view: IOnboardingView;
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  setView: (view: IOnboardingView) => void;
  openProject: (projectId: string) => void;
  selectTask: (taskId: string | null) => void;
  backToList: () => void;
  openTemplates: () => void;
  openReports: () => void;
};

export const useOnboardingNavStore = create<IOnboardingNavState>(set => ({
  view: 'project-list',
  selectedProjectId: null,
  selectedTaskId: null,
  setView: view => set({ view }),
  openProject: projectId =>
    set({ view: 'project-detail', selectedProjectId: projectId, selectedTaskId: null }),
  selectTask: taskId => set({ selectedTaskId: taskId }),
  backToList: () => set({ view: 'project-list', selectedProjectId: null, selectedTaskId: null }),
  openTemplates: () => set({ view: 'template-list', selectedProjectId: null, selectedTaskId: null }),
  openReports: () => set({ view: 'reports', selectedProjectId: null, selectedTaskId: null }),
}));

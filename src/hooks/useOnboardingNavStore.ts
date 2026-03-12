import { create } from 'zustand';

type IOnboardingView = 'project-list' | 'project-detail';

type IOnboardingNavState = {
  view: IOnboardingView;
  selectedProjectId: string | null;
  setView: (view: IOnboardingView) => void;
  openProject: (projectId: string) => void;
  backToList: () => void;
};

export const useOnboardingNavStore = create<IOnboardingNavState>(set => ({
  view: 'project-list',
  selectedProjectId: null,
  setView: view => set({ view }),
  openProject: projectId =>
    set({ view: 'project-detail', selectedProjectId: projectId }),
  backToList: () => set({ view: 'project-list', selectedProjectId: null }),
}));

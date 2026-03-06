import { create } from 'zustand';

type INavState = {
  activePage: string;
  activeSection: string;
  setActivePage: (page: string, section?: string) => void;
};

export const useNavStore = create<INavState>(set => ({
  activePage: 'general-settings',
  activeSection: '',

  setActivePage: (page: string, section?: string) =>
    set({ activePage: page, activeSection: section || '' }),
}));

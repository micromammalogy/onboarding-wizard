import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type INavState = {
  activePage: string;
  activeSection: string;
  setActivePage: (page: string, section?: string) => void;
};

export const useNavStore = create<INavState>()(
  persist(
    set => ({
      activePage: 'fulfillment-location',
      activeSection: 'shipping-settings',

      setActivePage: (page: string, section?: string) =>
        set({ activePage: page, activeSection: section || '' }),
    }),
    { name: 'zonos-nav' },
  ),
);

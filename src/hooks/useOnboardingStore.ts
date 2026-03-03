import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type IShopifyPlan = 'basic' | 'grow' | 'advanced' | 'plus';

type IOnboardingState = {
  shopifyPlan: IShopifyPlan | null;
  setShopifyPlan: (plan: IShopifyPlan) => void;
  resetOnboarding: () => void;
};

export type { IShopifyPlan };

export const useOnboardingStore = create<IOnboardingState>()(
  persist(
    set => ({
      shopifyPlan: null,
      setShopifyPlan: (plan: IShopifyPlan) => set({ shopifyPlan: plan }),
      resetOnboarding: () => set({ shopifyPlan: null }),
    }),
    { name: 'zonos-onboarding' },
  ),
);

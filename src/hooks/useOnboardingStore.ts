import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type IEcommercePlatform =
  | 'shopify'
  | 'etsy'
  | 'bigcommerce'
  | 'magento'
  | 'woocommerce'
  | 'volusion'
  | 'miva'
  | 'zonos'
  | 'other';

type IShopifyPlan = 'basic' | 'grow' | 'advanced' | 'plus';

type IOnboardingState = {
  ecommercePlatform: IEcommercePlatform | null;
  shopifyPlan: IShopifyPlan | null;
  setEcommercePlatform: (platform: IEcommercePlatform) => void;
  setShopifyPlan: (plan: IShopifyPlan) => void;
  resetOnboarding: () => void;
};

export type { IEcommercePlatform, IShopifyPlan };

export const useOnboardingStore = create<IOnboardingState>()(
  persist(
    set => ({
      ecommercePlatform: null,
      shopifyPlan: null,
      setEcommercePlatform: (platform: IEcommercePlatform) =>
        set({ ecommercePlatform: platform }),
      setShopifyPlan: (plan: IShopifyPlan) => set({ shopifyPlan: plan }),
      resetOnboarding: () =>
        set({ ecommercePlatform: null, shopifyPlan: null }),
    }),
    { name: 'zonos-onboarding' },
  ),
);

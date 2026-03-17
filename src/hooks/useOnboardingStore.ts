import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type IEcommercePlatform =
  | 'bigcommerce'
  | 'cart'
  | 'custom'
  | 'magento'
  | 'miva'
  | 'salesforce'
  | 'shopify'
  | 'wix'
  | 'woocommerce'
  | 'xcart';

type IShopifyPlan = 'basic' | 'grow' | 'advanced' | 'plus';

type IOnboardingState = {
  ecommercePlatform: IEcommercePlatform | null;
  shopifyPlan: IShopifyPlan | null;
  carrierApiAcknowledged: boolean;
  editingPlan: boolean;
  setEcommercePlatform: (platform: IEcommercePlatform) => void;
  setShopifyPlan: (plan: IShopifyPlan) => void;
  setEditingPlan: (editing: boolean) => void;
  acknowledgeCarrierApi: () => void;
  resetCarrierApi: () => void;
  resetOnboarding: () => void;
};

export type { IEcommercePlatform, IShopifyPlan };

export const useOnboardingStore = create<IOnboardingState>()(
  persist(
    set => ({
      ecommercePlatform: null,
      shopifyPlan: null,
      carrierApiAcknowledged: false,
      editingPlan: false,
      setEcommercePlatform: (platform: IEcommercePlatform) =>
        set({ ecommercePlatform: platform }),
      setShopifyPlan: (plan: IShopifyPlan) =>
        set({ shopifyPlan: plan, editingPlan: false }),
      setEditingPlan: (editing: boolean) => set({ editingPlan: editing }),
      acknowledgeCarrierApi: () => set({ carrierApiAcknowledged: true }),
      resetCarrierApi: () => set({ carrierApiAcknowledged: false }),
      resetOnboarding: () =>
        set({ ecommercePlatform: null, shopifyPlan: null, carrierApiAcknowledged: false, editingPlan: false }),
    }),
    { name: 'zonos-onboarding' },
  ),
);

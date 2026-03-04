'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import { PlatformSelect } from './PlatformSelect';
import { ShopifyPlanSelect } from './ShopifyPlanSelect';
import { CarrierServiceApiPage } from './CarrierServiceApiPage';

type IOnboardingGateProps = {
  children: ReactNode;
};

export const OnboardingGate = ({ children }: IOnboardingGateProps) => {
  const { ecommercePlatform, shopifyPlan, carrierApiAcknowledged, editingPlan } = useOnboardingStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f9fafb',
        }}
      />
    );
  }

  // Step 1: Select e-commerce platform
  if (!ecommercePlatform) {
    return <PlatformSelect />;
  }

  // Step 2: If Shopify, select plan (or re-editing)
  if (ecommercePlatform === 'shopify' && (!shopifyPlan || editingPlan)) {
    return <ShopifyPlanSelect />;
  }

  // Step 3: Basic/Grow plans need Carrier Service API instructions
  if (
    ecommercePlatform === 'shopify' &&
    (shopifyPlan === 'basic' || shopifyPlan === 'grow') &&
    !carrierApiAcknowledged
  ) {
    return <CarrierServiceApiPage />;
  }

  return <>{children}</>;
};

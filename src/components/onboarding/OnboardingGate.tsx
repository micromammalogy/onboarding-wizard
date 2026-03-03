'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import { PlatformSelect } from './PlatformSelect';
import { ShopifyPlanSelect } from './ShopifyPlanSelect';

type IOnboardingGateProps = {
  children: ReactNode;
};

export const OnboardingGate = ({ children }: IOnboardingGateProps) => {
  const { ecommercePlatform, shopifyPlan } = useOnboardingStore();
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

  // Step 2: If Shopify, select plan
  if (ecommercePlatform === 'shopify' && !shopifyPlan) {
    return <ShopifyPlanSelect />;
  }

  return <>{children}</>;
};

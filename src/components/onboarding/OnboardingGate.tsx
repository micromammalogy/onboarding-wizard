'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import { ShopifyPlanSelect } from './ShopifyPlanSelect';

type IOnboardingGateProps = {
  children: ReactNode;
};

export const OnboardingGate = ({ children }: IOnboardingGateProps) => {
  const { shopifyPlan } = useOnboardingStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  if (!shopifyPlan) {
    return <ShopifyPlanSelect />;
  }

  return <>{children}</>;
};

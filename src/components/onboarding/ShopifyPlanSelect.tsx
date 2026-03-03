'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import {
  useOnboardingStore,
  type IShopifyPlan,
} from '@/hooks/useOnboardingStore';
import styles from './ShopifyPlanSelect.module.scss';

type IPlanOption = {
  value: IShopifyPlan;
  name: string;
  description: string;
};

const PLAN_OPTIONS: IPlanOption[] = [
  {
    value: 'basic',
    name: 'Basic',
    description: 'For individuals & small businesses getting started with international selling.',
  },
  {
    value: 'grow',
    name: 'Grow',
    description: 'For growing businesses that need more reporting and lower transaction fees.',
  },
  {
    value: 'advanced',
    name: 'Advanced',
    description: 'For scaling businesses with advanced reporting and third-party calculated shipping.',
  },
  {
    value: 'plus',
    name: 'Plus',
    description: 'For high-volume merchants and large enterprises needing dedicated support.',
  },
];

export const ShopifyPlanSelect = () => {
  const { shopifyPlan, setShopifyPlan } = useOnboardingStore();
  const [selected, setSelected] = useState<IShopifyPlan | null>(shopifyPlan);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && shopifyPlan) {
      setSelected(shopifyPlan);
    }
  }, [isHydrated, shopifyPlan]);

  if (!isHydrated) {
    return null;
  }

  const handleContinue = () => {
    if (selected) {
      setShopifyPlan(selected);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoRow}>
            <div className={styles.shopifyLogo}>S</div>
            <div className={styles.connector} />
            <div className={styles.zonosLogo}>Z</div>
          </div>
          <Text type="title">Select your Shopify plan</Text>
          <Text type="body" color="gray600">
            Choose the Shopify plan your store is currently on. This helps us
            tailor your Zonos setup experience.
          </Text>
        </div>

        <div className={styles.planGrid}>
          {PLAN_OPTIONS.map(plan => (
            <button
              key={plan.value}
              type="button"
              className={`${styles.planCard} ${selected === plan.value ? styles.selected : ''}`}
              onClick={() => setSelected(plan.value)}
            >
              {selected === plan.value && (
                <div className={styles.checkIcon}>
                  <CheckmarkIcon size={14} />
                </div>
              )}
              <span className={styles.planName}>{plan.name}</span>
              <span className={styles.planDescription}>
                {plan.description}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <Button
            disabled={!selected}
            onClick={handleContinue}
            size="lg"
            variant="primary"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

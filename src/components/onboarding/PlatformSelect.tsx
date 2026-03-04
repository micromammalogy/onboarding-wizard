'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import {
  useOnboardingStore,
  type IEcommercePlatform,
} from '@/hooks/useOnboardingStore';
import { PlatformLogo } from './PlatformLogo';
import styles from './PlatformSelect.module.scss';

type IPlatformOption = {
  label: string;
  value: IEcommercePlatform;
};

const PLATFORM_OPTIONS: IPlatformOption[] = [
  { label: 'Shopify', value: 'shopify' },
  { label: 'Etsy', value: 'etsy' },
  { label: 'BigCommerce', value: 'bigcommerce' },
  { label: 'Magento', value: 'magento' },
  { label: 'WooCommerce', value: 'woocommerce' },
  { label: 'Volusion', value: 'volusion' },
  { label: 'Miva', value: 'miva' },
  { label: 'Zonos', value: 'zonos' },
  { label: 'Other', value: 'other' },
];

export const PlatformSelect = () => {
  const { ecommercePlatform, setEcommercePlatform } = useOnboardingStore();
  const [selected, setSelected] = useState<IEcommercePlatform | null>(
    ecommercePlatform,
  );

  const handleSave = () => {
    if (selected) {
      setEcommercePlatform(selected);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Text type="title">Select your platform</Text>
          <Text type="body" color="gray600">
            Choose the e-commerce platform your store runs on.
          </Text>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {PLATFORM_OPTIONS.map(platform => {
            const isSelected = selected === platform.value;
            const hasLogo = platform.value !== 'other';
            return (
              <button
                key={platform.value}
                type="button"
                onClick={() => setSelected(platform.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 16px',
                  background: isSelected ? 'var(--amino-blue-50, #eff6ff)' : 'white',
                  border: `2px solid ${isSelected ? '#2563eb' : 'var(--amino-gray-200, #e5e7eb)'}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, background 0.15s',
                  boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none',
                }}
              >
                {hasLogo && (
                  <PlatformLogo platform={platform.value} size={28} />
                )}
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isSelected ? '#2563eb' : 'var(--amino-gray-900, #111827)',
                  }}
                >
                  {platform.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className={styles.footer}>
          <Button
            disabled={!selected}
            onClick={handleSave}
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

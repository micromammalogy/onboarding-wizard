'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import {
  useOnboardingStore,
  type IEcommercePlatform,
} from '@/hooks/useOnboardingStore';
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
  const [selected, setSelected] = useState<IPlatformOption | null>(
    PLATFORM_OPTIONS.find(o => o.value === ecommercePlatform) ?? null,
  );

  const handleSave = () => {
    if (selected) {
      setEcommercePlatform(selected.value);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Select
          label="E-commerce platform"
          options={PLATFORM_OPTIONS}
          value={selected}
          onChange={option => setSelected(option ?? null)}
          isClearable
        />
        <div className={styles.footer}>
          <Button
            disabled={!selected}
            onClick={handleSave}
            variant="primary"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

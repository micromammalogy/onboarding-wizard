'use client';

import { ChevronRightIcon } from '@zonos/amino/icons/ChevronRightIcon';
import { useNavStore } from '@/hooks/useNavStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import styles from './WizardBreadcrumbs.module.scss';

const PAGE_BREADCRUMBS: Record<string, { section?: string; page: string }> = {
  // Shipping Settings
  'fulfillment-location': { section: 'Shipping Settings', page: 'Fulfillment Location' },
  'shipping-rules': { section: 'Shipping Settings', page: 'Shipping Rules' },
  'cartonization': { section: 'Shipping Settings', page: 'Cartonization' },
  'lcg-certification': { section: 'Shipping Settings', page: 'LCG Certification' },
  // Standalone
  'hello-settings': { page: 'Hello Settings' },
  'checkout-settings': { page: 'Checkout Settings' },
  // Defaults / LCG
  'default-coo': { section: 'Defaults', page: 'Default Country of Origin' },
  'default-hs-code': { section: 'Defaults', page: 'Default HS Code' },
  'lcg-enable': { section: 'Defaults', page: 'LCG Enable On/Off' },
  // Organization Status
  'organization-status': { page: 'Organization Status' },
  // General
  'business-name': { section: 'General', page: 'Business Name' },
  'website-url': { section: 'General', page: 'Website URL' },
  'ecommerce-platform': { section: 'General', page: 'E-commerce Platform' },
  'business-address': { section: 'General', page: 'Business Address' },
  // Branding
  'branding-settings': { page: 'Branding Settings' },
};

export const WizardBreadcrumbs = () => {
  const { activePage } = useNavStore();
  const { organizationId } = useAuthStore();

  const breadcrumb = PAGE_BREADCRUMBS[activePage] || { page: activePage };

  return (
    <div className={styles.headerBar}>
      <div className={styles.breadcrumbs}>
        {breadcrumb.section && (
          <>
            <span className={styles.breadcrumbParent}>{breadcrumb.section}</span>
            <ChevronRightIcon size={14} color="gray400" />
          </>
        )}
        <span className={styles.breadcrumbCurrent}>{breadcrumb.page}</span>
      </div>
      <div className={styles.headerActions}>
        <span style={{ fontSize: 12, color: 'var(--amino-gray-400)' }}>
          Org {organizationId}
        </span>
      </div>
    </div>
  );
};

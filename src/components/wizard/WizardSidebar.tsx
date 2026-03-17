'use client';

import { LogoutIcon } from '@zonos/amino/icons/LogoutIcon';
import { useNavStore } from '@/hooks/useNavStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import { OrgSwitcher } from './OrgSwitcher';
import styles from './WizardSidebar.module.scss';

type INavGroup = {
  header: string;
  items: { label: string; page: string }[];
};

const NAV_GROUPS: INavGroup[] = [
  {
    header: 'Account',
    items: [
      { label: 'General', page: 'general-settings' },
      { label: 'Team', page: 'team' },
      { label: 'Billing', page: 'billing' },
    ],
  },
  {
    header: 'Shipping',
    items: [
      { label: 'Locations', page: 'locations' },
      { label: 'Cartonization', page: 'cartonization' },
      { label: 'Labels', page: 'labels' },
      { label: 'Packing slips', page: 'packing-slips' },
    ],
  },
  {
    header: 'Landed cost',
    items: [
      { label: 'Classify', page: 'classify' },
      { label: 'Catalog', page: 'catalog' },
      { label: 'Tax IDs', page: 'tax-ids' },
      { label: 'Rules', page: 'rules' },
    ],
  },
  {
    header: 'Checkout',
    items: [
      { label: 'Checkout settings', page: 'checkout-settings' },
      { label: 'Custom messages', page: 'custom-messages-checkout' },
      { label: 'Discounts', page: 'discounts' },
    ],
  },
  {
    header: 'Branding',
    items: [
      { label: 'Branding settings', page: 'branding-settings' },
    ],
  },
  {
    header: 'Hello',
    items: [
      { label: 'Hello settings', page: 'hello-settings' },
      { label: 'Custom messages', page: 'custom-messages-hello' },
    ],
  },
];

const activeStyle: React.CSSProperties = {
  background: 'var(--amino-blue-50)',
  color: 'var(--amino-blue-700)',
};

export const WizardSidebar = () => {
  const { activePage, setActivePage } = useNavStore();
  const { organizationName, logout } = useAuthStore();

  const userInitial = (organizationName || '?').charAt(0).toUpperCase();

  return (
    <div className={styles.sidebar}>
      <OrgSwitcher />

      <nav className={styles.navSection}>
        {NAV_GROUPS.map(group => (
          <div key={group.header} className={styles.navGroup}>
            <div className={styles.navGroupHeader}>{group.header}</div>
            {group.items.map(item => (
              <div
                key={item.page}
                className={styles.navItemWrapper}
                onClick={() => setActivePage(item.page)}
              >
                <div
                  className={styles.navItem}
                  style={activePage === item.page ? activeStyle : undefined}
                >
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className={styles.userFooter}>
        <div className={styles.userAvatar}>{userInitial}</div>
        <span className={styles.userName}>{organizationName || 'User'}</span>
        <button className={styles.logoutButton} onClick={logout} title="Log out">
          <LogoutIcon size={16} />
        </button>
      </div>
    </div>
  );
};

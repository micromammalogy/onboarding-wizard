'use client';

import { NavigationGroup, NavigationItem } from '@zonos/amino/components/layout/NavigationGroup';
import { BoxesIcon } from '@zonos/amino/icons/BoxesIcon';
import { LocationIcon } from '@zonos/amino/icons/LocationIcon';
import { ShoppingListIcon } from '@zonos/amino/icons/ShoppingListIcon';
import { TruckIcon } from '@zonos/amino/icons/TruckIcon';
import { FileIcon } from '@zonos/amino/icons/FileIcon';
import { HelloIcon } from '@zonos/amino/icons/HelloIcon';
import { CheckoutIcon } from '@zonos/amino/icons/CheckoutIcon';
import { GlobeIcon } from '@zonos/amino/icons/GlobeIcon';
import { SettingsIcon } from '@zonos/amino/icons/SettingsIcon';
import { PaletteIcon } from '@zonos/amino/icons/PaletteIcon';
import { DashboardIcon } from '@zonos/amino/icons/DashboardIcon';
import { LogoutIcon } from '@zonos/amino/icons/LogoutIcon';
import { useNavStore } from '@/hooks/useNavStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { OrgSwitcher } from './OrgSwitcher';
import styles from './WizardSidebar.module.scss';

type INavSection = {
  label: string;
  key: string;
  icon: React.ReactNode;
  items: {
    label: string;
    page: string;
  }[];
};

const NAV_SECTIONS: INavSection[] = [
  {
    label: 'Shipping Settings',
    key: 'shipping-settings',
    icon: <BoxesIcon size={24} />,
    items: [
      { label: 'Fulfillment Location', page: 'fulfillment-location' },
      { label: 'Shipping Rules', page: 'shipping-rules' },
      { label: 'Cartonization', page: 'cartonization' },
      { label: 'LCG Certification', page: 'lcg-certification' },
    ],
  },
  {
    label: 'Defaults / LCG',
    key: 'defaults-lcg',
    icon: <GlobeIcon size={24} />,
    items: [
      { label: 'Default Country of Origin', page: 'default-coo' },
      { label: 'Default HS Code', page: 'default-hs-code' },
      { label: 'LCG Enable On/Off', page: 'lcg-enable' },
    ],
  },
  {
    label: 'General',
    key: 'general',
    icon: <SettingsIcon size={24} />,
    items: [
      { label: 'Business Name', page: 'business-name' },
      { label: 'Website URL', page: 'website-url' },
      { label: 'E-commerce Platform', page: 'ecommerce-platform' },
      { label: 'Business Address', page: 'business-address' },
    ],
  },
];

const STANDALONE_ITEMS = [
  { label: 'Hello Settings', page: 'hello-settings', icon: <HelloIcon size={24} /> },
  { label: 'Checkout Settings', page: 'checkout-settings', icon: <CheckoutIcon size={24} /> },
  { label: 'Organization Status', page: 'organization-status', icon: <DashboardIcon size={24} /> },
  { label: 'Branding Settings', page: 'branding-settings', icon: <PaletteIcon size={24} /> },
];

const activeStyle: React.CSSProperties = {
  background: 'var(--amino-blue-50)',
  color: 'var(--amino-blue-700)',
};

export const WizardSidebar = () => {
  const { activePage, activeSection, setActivePage } = useNavStore();
  const { organizationName, logout } = useAuthStore();

  const userInitial = (organizationName || '?').charAt(0).toUpperCase();

  const isSectionActive = (section: INavSection) =>
    section.items.some(item => item.page === activePage);

  return (
    <div className={styles.sidebar}>
      <OrgSwitcher />

      <nav className={styles.navSection}>
        {/* Grouped sections */}
        {NAV_SECTIONS.map(section => (
          <NavigationGroup
            key={section.key}
            collapsed={activeSection !== section.key}
            content={
              <div
                onClick={() => {
                  if (activeSection === section.key) {
                    setActivePage(activePage, '');
                  } else {
                    setActivePage(section.items[0].page, section.key);
                  }
                }}
              >
                <NavigationItem
                  content={section.label}
                  icon={section.icon}
                  isActive={isSectionActive(section)}
                  style={isSectionActive(section) ? activeStyle : undefined}
                />
              </div>
            }
          >
            {section.items.map(item => (
              <div
                key={item.page}
                className={styles.navItemWrapper}
                onClick={() => setActivePage(item.page, section.key)}
              >
                <NavigationItem
                  content={item.label}
                  isActive={activePage === item.page}
                  style={activePage === item.page ? activeStyle : undefined}
                />
              </div>
            ))}
          </NavigationGroup>
        ))}

        <div className={styles.navGap} />

        {/* Standalone pages */}
        {STANDALONE_ITEMS.map(item => (
          <div
            key={item.page}
            className={styles.navItemWrapper}
            onClick={() => setActivePage(item.page)}
          >
            <NavigationItem
              content={item.label}
              icon={item.icon}
              isActive={activePage === item.page}
              style={activePage === item.page ? activeStyle : undefined}
            />
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

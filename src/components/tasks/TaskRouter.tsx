'use client';

import { useNavStore } from '@/hooks/useNavStore';

// Shipping
import { FulfillmentLocationPage } from './shipping/FulfillmentLocationPage';
import { ShippingRulesPage } from './shipping/ShippingRulesPage';
import { CartonizationPage } from './shipping/CartonizationPage';
import { LcgCertificationPage } from './shipping/LcgCertificationPage';

// Standalone
import { HelloSettingsPage } from './HelloSettingsPage';
import { CheckoutSettingsPage } from './CheckoutSettingsPage';
import { OrganizationStatusPage } from './OrganizationStatusPage';
import { BrandingSettingsPage } from './BrandingSettingsPage';

// Defaults
import { DefaultCountryOfOriginPage } from './defaults/DefaultCountryOfOriginPage';
import { DefaultHsCodePage } from './defaults/DefaultHsCodePage';
import { LcgEnablePage } from './defaults/LcgEnablePage';

// General
import { GeneralSettingsPage } from './general/GeneralSettingsPage';

const PAGE_MAP: Record<string, React.ComponentType> = {
  // Shipping Configuration
  'fulfillment-location': FulfillmentLocationPage,
  'shipping-rules': ShippingRulesPage,
  'cartonization': CartonizationPage,
  'lcg-certification': LcgCertificationPage,

  // Standalone
  'hello-settings': HelloSettingsPage,
  'checkout-settings': CheckoutSettingsPage,
  'organization-status': OrganizationStatusPage,
  'branding-settings': BrandingSettingsPage,

  // Defaults / LCG
  'default-coo': DefaultCountryOfOriginPage,
  'default-hs-code': DefaultHsCodePage,
  'lcg-enable': LcgEnablePage,

  // General
  'general': GeneralSettingsPage,
};

export const TaskRouter = () => {
  const { activePage } = useNavStore();
  const Page = PAGE_MAP[activePage];

  if (!Page) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <p style={{ fontSize: 16, color: 'var(--amino-gray-500)' }}>
          Page not found: {activePage}
        </p>
      </div>
    );
  }

  return <Page />;
};

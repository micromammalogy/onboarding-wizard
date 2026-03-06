'use client';

import { useNavStore } from '@/hooks/useNavStore';

// Account
import { GeneralSettingsPage } from './general/GeneralSettingsPage';
import { TeamPage } from './account/TeamPage';
import { BillingPage } from './account/BillingPage';

// Shipping
import { FulfillmentLocationPage } from './shipping/FulfillmentLocationPage';
import { CartonizationPage } from './shipping/CartonizationPage';
import { LabelsPage } from './shipping/LabelsPage';
import { PackingSlipsPage } from './shipping/PackingSlipsPage';

// Landed cost
import { ClassifySettingsPage } from './landed-cost/ClassifySettingsPage';
import { CatalogSettingsPage } from './landed-cost/CatalogSettingsPage';
import { TaxIdsPage } from './landed-cost/TaxIdsPage';
import { ShippingRulesPage } from './shipping/ShippingRulesPage';

// Checkout
import { CheckoutSettingsPage } from './CheckoutSettingsPage';
import { CustomMessagesCheckoutPage } from './checkout/CustomMessagesCheckoutPage';
import { DiscountsPage } from './checkout/DiscountsPage';

// Branding
import { BrandingSettingsPage } from './BrandingSettingsPage';

// Hello
import { HelloSettingsPage } from './HelloSettingsPage';
import { CustomMessagesHelloPage } from './hello/CustomMessagesHelloPage';

const PAGE_MAP: Record<string, React.ComponentType> = {
  // Account
  'general-settings': GeneralSettingsPage,
  'team': TeamPage,
  'billing': BillingPage,

  // Shipping
  'locations': FulfillmentLocationPage,
  'cartonization': CartonizationPage,
  'labels': LabelsPage,
  'packing-slips': PackingSlipsPage,

  // Landed cost
  'classify': ClassifySettingsPage,
  'catalog': CatalogSettingsPage,
  'tax-ids': TaxIdsPage,
  'rules': ShippingRulesPage,

  // Checkout
  'checkout-settings': CheckoutSettingsPage,
  'custom-messages-checkout': CustomMessagesCheckoutPage,
  'discounts': DiscountsPage,

  // Branding
  'branding-settings': BrandingSettingsPage,

  // Hello
  'hello-settings': HelloSettingsPage,
  'custom-messages-hello': CustomMessagesHelloPage,
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

'use client';

import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';

const SHOPIFY_APP_URL = 'https://apps.shopify.com/duty-and-tax-calculator-iglobal-stores';

export const ShopifyAppPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Install Zonos Duty and Tax</Text>

      <div
        style={{
          padding: 48,
          background: 'white',
          borderRadius: 8,
          border: '1px solid var(--amino-gray-200)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          textAlign: 'center',
        }}
      >
        <Text type="subtitle">Connect your Shopify store</Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-600)', maxWidth: 480, margin: 0 }}>
          The Zonos Duty and Tax app calculates accurate landed costs at checkout, including
          duties, taxes, and fees — so your customers never face surprise charges at delivery.
          Install it on your Shopify store to get started.
        </p>

        <Button
          variant="primary"
          onClick={() => window.open(SHOPIFY_APP_URL, '_blank')}
          style={{ marginTop: 8 }}
        >
          Install on Shopify
        </Button>

        <p style={{ fontSize: 13, color: 'var(--amino-gray-400)', margin: 0 }}>
          You&apos;ll be redirected to the Shopify App Store. Return here to continue
          configuring your Zonos settings once the app is installed.
        </p>
      </div>
    </div>
  );
};

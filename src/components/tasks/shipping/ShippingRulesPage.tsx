'use client';

import { Text } from '@zonos/amino/components/text/Text';

export const ShippingRulesPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Shipping Rules</Text>
      <div
        style={{
          padding: 48,
          textAlign: 'center',
          background: 'white',
          borderRadius: 8,
          border: '1px solid var(--amino-gray-200)',
        }}
      >
        <Text type="subtitle" color="gray500">
          Custom code and flat rate rules
        </Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
          TODO: Wire up shipping rule mutations once GraphQL schema is confirmed.
        </p>
      </div>
    </div>
  );
};

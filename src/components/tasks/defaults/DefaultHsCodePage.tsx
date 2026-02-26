'use client';

import { Text } from '@zonos/amino/components/text/Text';

export const DefaultHsCodePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Default HS Code</Text>
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
          Set the default HS code for this merchant
        </Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
          TODO: Find the correct mutation for default HS code.
        </p>
      </div>
    </div>
  );
};

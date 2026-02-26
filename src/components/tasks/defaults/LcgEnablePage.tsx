'use client';

import { Text } from '@zonos/amino/components/text/Text';

export const LcgEnablePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">LCG Enable On/Off</Text>
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
          Toggle landed cost guarantee for this merchant
        </Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
          TODO: Find the setting mutation to enable/disable LCG.
        </p>
      </div>
    </div>
  );
};

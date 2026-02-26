'use client';

import { Text } from '@zonos/amino/components/text/Text';

export const CartonizationPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Cartonization</Text>
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
          Add, edit, and delete box configurations
        </Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
          TODO: Wire up cartonization create/update/delete mutations once available.
        </p>
      </div>
    </div>
  );
};

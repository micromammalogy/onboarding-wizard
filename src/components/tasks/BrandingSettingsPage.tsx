'use client';

import { Text } from '@zonos/amino/components/text/Text';

export const BrandingSettingsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Branding Settings</Text>
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
          Configure branding and visual identity
        </Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
          TODO: Wire up branding settings queries and mutations.
        </p>
      </div>
    </div>
  );
};

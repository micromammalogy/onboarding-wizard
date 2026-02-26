'use client';

import { Text } from '@zonos/amino/components/text/Text';

export const OrganizationStatusPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Organization Status</Text>
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
          View and manage organization status
        </Text>
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
          TODO: Determine if organization status is read-only or editable.
        </p>
      </div>
    </div>
  );
};

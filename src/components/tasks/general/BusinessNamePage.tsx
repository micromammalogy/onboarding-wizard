'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Text } from '@zonos/amino/components/text/Text';
import { useOrganizationDetail } from '@/hooks/useOrganizationDetail';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';

const ORGANIZATION_UPDATE = `
  mutation organizationUpdate($input: OrganizationUpdateInput!) {
    organizationUpdate(input: $input) {
      id
      name
    }
  }
`;

export const BusinessNamePage = () => {
  const { org, isLoading } = useOrganizationDetail();
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (org?.name) setName(org.name);
  }, [org]);

  const { execute, isLoading: saving } = useGraphQLMutation({
    schema: 'internal',
    query: ORGANIZATION_UPDATE,
  });

  const handleSave = async () => {
    setStatus('idle');
    setErrorMsg('');
    try {
      await execute({ input: { name } });
      setStatus('saved');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save.');
      setStatus('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Business Name</Text>

      <div
        style={{
          background: 'white',
          border: '1px solid var(--amino-gray-200)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--amino-gray-100)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
          }}
        >
          <div>
            <Text type="subheader">Business Name</Text>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              The merchant&apos;s registered business name.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!name.trim()}
            style={{ flexShrink: 0 }}
          >
            Save
          </Button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isLoading ? (
            <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', margin: 0 }}>
              Loading...
            </p>
          ) : (
            <Input
              label="Business Name"
              value={name}
              onChange={e => {
                setName(e.target.value);
                setStatus('idle');
              }}
            />
          )}

          {status === 'saved' && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--amino-green-50, #f0fdf4)',
                border: '1px solid var(--amino-green-200, #bbf7d0)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--amino-green-700, #15803d)',
              }}
            >
              Changes saved successfully.
            </div>
          )}
          {status === 'error' && (
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--amino-red-50, #fef2f2)',
                border: '1px solid var(--amino-red-200, #fecaca)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--amino-red-600)',
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

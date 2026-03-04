'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
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

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'CN', label: 'China' },
  { value: 'MX', label: 'Mexico' },
];

type IAddress = {
  line1: string;
  line2: string;
  locality: string;
  administrativeAreaCode: string;
  postalCode: string;
  countryCode: string;
};

const EMPTY: IAddress = {
  line1: '',
  line2: '',
  locality: '',
  administrativeAreaCode: '',
  postalCode: '',
  countryCode: 'US',
};

export const BusinessAddressPage = () => {
  const { org, isLoading } = useOrganizationDetail();
  const [address, setAddress] = useState<IAddress>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loc = org?.party?.location;
    if (!loc) return;
    setAddress({
      line1: loc.line1 || '',
      line2: loc.line2 || '',
      locality: loc.locality || '',
      administrativeAreaCode: loc.administrativeAreaCode || '',
      postalCode: loc.postalCode || '',
      countryCode: loc.countryCode || 'US',
    });
  }, [org]);

  const { execute, isLoading: saving } = useGraphQLMutation({
    schema: 'internal',
    query: ORGANIZATION_UPDATE,
  });

  const handleSave = async () => {
    setStatus('idle');
    setErrorMsg('');
    try {
      await execute({ input: { address } });
      setStatus('saved');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save.');
      setStatus('error');
    }
  };

  const update = (field: keyof IAddress) => (value: string) => {
    setAddress(a => ({ ...a, [field]: value }));
    setStatus('idle');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Business Address</Text>

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
            <Text type="subheader">Business Address</Text>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Primary business address for this merchant.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!address.line1.trim()}
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
            <>
              <Select
                label="Country"
                value={COUNTRY_OPTIONS.find(o => o.value === address.countryCode) || null}
                onChange={opt => {
                  if (opt) update('countryCode')(opt.value);
                }}
                options={COUNTRY_OPTIONS}
              />
              <Input
                label="Address Line 1"
                value={address.line1}
                onChange={e => update('line1')(e.target.value)}
              />
              <Input
                label="Address Line 2"
                value={address.line2}
                onChange={e => update('line2')(e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Input
                  label="City"
                  value={address.locality}
                  onChange={e => update('locality')(e.target.value)}
                />
                <Input
                  label="State / Province"
                  value={address.administrativeAreaCode}
                  onChange={e => update('administrativeAreaCode')(e.target.value)}
                />
                <Input
                  label="Postal Code"
                  value={address.postalCode}
                  onChange={e => update('postalCode')(e.target.value)}
                />
              </div>
            </>
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

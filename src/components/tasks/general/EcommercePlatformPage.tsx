'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { useOnboardingStore, type IShopifyPlan } from '@/hooks/useOnboardingStore';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';

const SHOPIFY_PLANS: { id: IShopifyPlan; label: string; description: string }[] = [
  { id: 'basic', label: 'Basic', description: 'For solo entrepreneurs' },
  { id: 'grow', label: 'Grow', description: 'For small teams' },
  { id: 'advanced', label: 'Advanced', description: 'For scaling businesses' },
  { id: 'plus', label: 'Plus', description: 'For enterprise merchants' },
];

const ORGANIZATION_UPDATE = `
  mutation organizationUpdate($input: OrganizationUpdateInput!) {
    organizationUpdate(input: $input) {
      id
      name
    }
  }
`;

export const EcommercePlatformPage = () => {
  const { shopifyPlan, setShopifyPlan } = useOnboardingStore();
  const [selected, setSelected] = useState<IShopifyPlan | null>(shopifyPlan);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { execute, isLoading: saving } = useGraphQLMutation({
    schema: 'internal',
    query: ORGANIZATION_UPDATE,
  });

  const handleSave = async () => {
    if (!selected) return;
    setStatus('idle');
    setErrorMsg('');
    try {
      await execute({ input: { ecommercePlatform: 'shopify', shopifyPlan: selected } });
      setShopifyPlan(selected);
      setStatus('saved');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save.');
      setStatus('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">E-commerce Platform</Text>

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
            <Text type="subheader">Shopify Plan</Text>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              The merchant&apos;s current Shopify subscription plan.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!selected}
            style={{ flexShrink: 0 }}
          >
            Save
          </Button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {SHOPIFY_PLANS.map(plan => {
              const isSelected = selected === plan.id;
              return (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelected(plan.id);
                    setStatus('idle');
                  }}
                  style={{
                    padding: '14px 16px',
                    background: isSelected ? 'var(--amino-blue-50)' : 'white',
                    border: `2px solid ${isSelected ? '#2563EB' : 'var(--amino-gray-200)'}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${isSelected ? '#2563EB' : 'var(--amino-gray-300)'}`,
                        background: isSelected ? '#2563EB' : 'white',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isSelected && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'white',
                          }}
                        />
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isSelected ? '#2563EB' : 'var(--amino-gray-900)',
                      }}
                    >
                      {plan.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--amino-gray-500)', paddingLeft: 24 }}>
                    {plan.description}
                  </div>
                </button>
              );
            })}
          </div>

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

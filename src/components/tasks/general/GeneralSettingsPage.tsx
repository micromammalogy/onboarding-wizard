'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import { useOrganizationDetail } from '@/hooks/useOrganizationDetail';
import { useOnboardingStore, type IEcommercePlatform, type IShopifyPlan } from '@/hooks/useOnboardingStore';
import { PlatformLogo } from '@/components/onboarding/PlatformLogo';

const ORGANIZATION_UPDATE = `
  mutation organizationUpdate($input: OrganizationUpdateInput!) {
    organizationUpdate(input: $input) {
      id
      name
    }
  }
`;

const PLATFORM_OPTIONS: { value: IEcommercePlatform; label: string }[] = [
  { label: 'Shopify', value: 'shopify' },
  { label: 'Etsy', value: 'etsy' },
  { label: 'BigCommerce', value: 'bigcommerce' },
  { label: 'Magento', value: 'magento' },
  { label: 'WooCommerce', value: 'woocommerce' },
  { label: 'Volusion', value: 'volusion' },
  { label: 'Miva', value: 'miva' },
  { label: 'Zonos', value: 'zonos' },
  { label: 'Other', value: 'other' },
];

const SHOPIFY_PLANS: { id: IShopifyPlan; label: string; description: string }[] = [
  { id: 'basic', label: 'Basic', description: 'For solo entrepreneurs' },
  { id: 'grow', label: 'Grow', description: 'For small teams' },
  { id: 'advanced', label: 'Advanced', description: 'For scaling businesses' },
  { id: 'plus', label: 'Plus', description: 'For enterprise merchants' },
];

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

type IStatus = 'idle' | 'saved' | 'error';

type IAddress = {
  line1: string;
  line2: string;
  locality: string;
  administrativeAreaCode: string;
  postalCode: string;
  countryCode: string;
};

const EMPTY_ADDRESS: IAddress = {
  line1: '',
  line2: '',
  locality: '',
  administrativeAreaCode: '',
  postalCode: '',
  countryCode: 'US',
};

const SaveFeedback = ({ status, errorMsg }: { status: IStatus; errorMsg: string }) => {
  if (status === 'saved') {
    return (
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
    );
  }
  if (status === 'error') {
    return (
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
    );
  }
  return null;
};

const SectionCard = ({
  title,
  description,
  onSave,
  saving,
  saveDisabled,
  status,
  errorMsg,
  children,
}: {
  title: string;
  description: string;
  onSave: () => void;
  saving: boolean;
  saveDisabled: boolean;
  status: IStatus;
  errorMsg: string;
  children: React.ReactNode;
}) => (
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
        <Text type="subheader">{title}</Text>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
          {description}
        </p>
      </div>
      <Button
        variant="primary"
        onClick={onSave}
        loading={saving}
        disabled={saveDisabled}
        style={{ flexShrink: 0 }}
      >
        Save
      </Button>
    </div>
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {children}
      <SaveFeedback status={status} errorMsg={errorMsg} />
    </div>
  </div>
);

export const GeneralSettingsPage = () => {
  const { org, isLoading } = useOrganizationDetail();
  const { ecommercePlatform, shopifyPlan, carrierApiAcknowledged, setEcommercePlatform, setEditingPlan } = useOnboardingStore();

  // Business info
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [infoStatus, setInfoStatus] = useState<IStatus>('idle');
  const [infoError, setInfoError] = useState('');

  // Platform
  const [selectedPlatform, setSelectedPlatform] = useState<{ value: IEcommercePlatform; label: string } | null>(
    PLATFORM_OPTIONS.find(o => o.value === ecommercePlatform) ?? null,
  );
  const [platformStatus, setPlatformStatus] = useState<IStatus>('idle');
  const [platformError, setPlatformError] = useState('');
  const [isChangingPlatform, setIsChangingPlatform] = useState(false);

  // Address
  const [address, setAddress] = useState<IAddress>(EMPTY_ADDRESS);
  const [addressStatus, setAddressStatus] = useState<IStatus>('idle');
  const [addressError, setAddressError] = useState('');

  // Populate from org data
  useEffect(() => {
    if (!org) return;
    if (org.name) setName(org.name);
    if (org.website) setWebsite(org.website);
    const loc = org.party?.location;
    if (loc) {
      setAddress({
        line1: loc.line1 || '',
        line2: loc.line2 || '',
        locality: loc.locality || '',
        administrativeAreaCode: loc.administrativeAreaCode || '',
        postalCode: loc.postalCode || '',
        countryCode: loc.countryCode || 'US',
      });
    }
  }, [org]);

  const { execute: saveInfo, isLoading: savingInfo } = useGraphQLMutation({ schema: 'internal', query: ORGANIZATION_UPDATE });
  const { execute: savePlatform, isLoading: savingPlatform } = useGraphQLMutation({ schema: 'internal', query: ORGANIZATION_UPDATE });
  const { execute: saveAddress, isLoading: savingAddress } = useGraphQLMutation({ schema: 'internal', query: ORGANIZATION_UPDATE });

  const handleSaveInfo = async () => {
    setInfoStatus('idle');
    try {
      await saveInfo({ input: { name, website } });
      setInfoStatus('saved');
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : 'Failed to save.');
      setInfoStatus('error');
    }
  };

  const handleSavePlatform = async () => {
    if (!selectedPlatform) return;
    setPlatformStatus('idle');
    try {
      await savePlatform({ input: { ecommercePlatform: selectedPlatform.value } });
      setEcommercePlatform(selectedPlatform.value);
      setIsChangingPlatform(false);
      setPlatformStatus('saved');
    } catch (err) {
      setPlatformError(err instanceof Error ? err.message : 'Failed to save.');
      setPlatformStatus('error');
    }
  };

  const handleSaveAddress = async () => {
    setAddressStatus('idle');
    try {
      await saveAddress({ input: { address } });
      setAddressStatus('saved');
    } catch (err) {
      setAddressError(err instanceof Error ? err.message : 'Failed to save.');
      setAddressStatus('error');
    }
  };

  const updateAddress = (field: keyof IAddress) => (value: string) => {
    setAddress(a => ({ ...a, [field]: value }));
    setAddressStatus('idle');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">General</Text>

      {isLoading ? (
        <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', margin: 0 }}>
          Loading organization details...
        </p>
      ) : (
        <>
          {/* Business Information */}
          <SectionCard
            title="Business Information"
            description="Basic details about this merchant's business."
            onSave={handleSaveInfo}
            saving={savingInfo}
            saveDisabled={!name.trim()}
            status={infoStatus}
            errorMsg={infoError}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input
                label="Business Name"
                value={name}
                onChange={e => { setName(e.target.value); setInfoStatus('idle'); }}
              />
              <Input
                label="Website URL"
                value={website}
                onChange={e => { setWebsite(e.target.value); setInfoStatus('idle'); }}
              />
            </div>
          </SectionCard>

          {/* E-commerce Platform */}
          <SectionCard
            title="E-commerce Platform"
            description="The merchant's e-commerce platform and plan."
            onSave={handleSavePlatform}
            saving={savingPlatform}
            saveDisabled={!isChangingPlatform || !selectedPlatform}
            status={platformStatus}
            errorMsg={platformError}
          >
            {/* Current platform display */}
            {!isChangingPlatform && selectedPlatform ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--amino-gray-50, #f9fafb)',
                  border: '1px solid var(--amino-gray-200)',
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selectedPlatform.value !== 'other' && (
                    <PlatformLogo platform={selectedPlatform.value} size={24} />
                  )}
                  <span style={{ fontSize: 13, color: 'var(--amino-gray-500)' }}>Current platform</span>
                  <span
                    style={{
                      padding: '3px 12px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: 99,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {selectedPlatform.label}
                  </span>
                </div>
                <button
                  onClick={() => { setIsChangingPlatform(true); setPlatformStatus('idle'); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: 13,
                    color: '#2563eb',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Switch platform
                </button>
              </div>
            ) : (
              /* Platform picker grid */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {PLATFORM_OPTIONS.map(platform => {
                    const isSelected = selectedPlatform?.value === platform.value;
                    const hasLogo = platform.value !== 'other';
                    return (
                      <button
                        key={platform.value}
                        type="button"
                        onClick={() => { setSelectedPlatform(platform); setPlatformStatus('idle'); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 14px',
                          background: isSelected ? 'var(--amino-blue-50, #eff6ff)' : 'white',
                          border: `2px solid ${isSelected ? '#2563eb' : 'var(--amino-gray-200, #e5e7eb)'}`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        {hasLogo && <PlatformLogo platform={platform.value} size={24} />}
                        <span style={{ fontSize: 13, fontWeight: 500, color: isSelected ? '#2563eb' : 'var(--amino-gray-900)' }}>
                          {platform.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => { setIsChangingPlatform(false); setSelectedPlatform(PLATFORM_OPTIONS.find(o => o.value === ecommercePlatform) ?? null); }}
                  style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--amino-gray-500)', cursor: 'pointer', alignSelf: 'flex-start' }}
                >
                  ← Cancel
                </button>
              </div>
            )}

            {selectedPlatform?.value === 'shopify' && shopifyPlan && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Current plan row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--amino-gray-50, #f9fafb)',
                    border: '1px solid var(--amino-gray-200)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: 'var(--amino-gray-500)' }}>Current plan</span>
                    <span
                      style={{
                        padding: '3px 12px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe',
                        borderRadius: 99,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {SHOPIFY_PLANS.find(p => p.id === shopifyPlan)?.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingPlan(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      fontSize: 13,
                      color: '#2563eb',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Change plan
                  </button>
                </div>

                {/* Carrier Service API badge — Grow plan only */}
                {shopifyPlan === 'grow' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      background: carrierApiAcknowledged ? 'var(--amino-green-50, #f0fdf4)' : 'var(--amino-yellow-50, #fefce8)',
                      border: `1px solid ${carrierApiAcknowledged ? 'var(--amino-green-200, #bbf7d0)' : 'var(--amino-yellow-200, #fde68a)'}`,
                      borderRadius: 8,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: carrierApiAcknowledged ? '#16a34a' : '#d97706',
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontWeight: 500, color: carrierApiAcknowledged ? '#15803d' : '#92400e' }}>
                      Carrier Service API
                    </span>
                    <span style={{ color: carrierApiAcknowledged ? '#15803d' : '#92400e' }}>
                      — {carrierApiAcknowledged ? 'Enabled' : 'Required — contact Shopify Support to activate'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Business Address */}
          <SectionCard
            title="Business Address"
            description="Primary business address for this merchant."
            onSave={handleSaveAddress}
            saving={savingAddress}
            saveDisabled={!address.line1.trim()}
            status={addressStatus}
            errorMsg={addressError}
          >
            <Select
              label="Country"
              value={COUNTRY_OPTIONS.find(o => o.value === address.countryCode) || null}
              onChange={opt => { if (opt) updateAddress('countryCode')(opt.value); }}
              options={COUNTRY_OPTIONS}
            />
            <Input
              label="Address Line 1"
              value={address.line1}
              onChange={e => updateAddress('line1')(e.target.value)}
            />
            <Input
              label="Address Line 2"
              value={address.line2}
              onChange={e => updateAddress('line2')(e.target.value)}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <Input
                label="City"
                value={address.locality}
                onChange={e => updateAddress('locality')(e.target.value)}
              />
              <Input
                label="State / Province"
                value={address.administrativeAreaCode}
                onChange={e => updateAddress('administrativeAreaCode')(e.target.value)}
              />
              <Input
                label="Postal Code"
                value={address.postalCode}
                onChange={e => updateAddress('postalCode')(e.target.value)}
              />
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
};

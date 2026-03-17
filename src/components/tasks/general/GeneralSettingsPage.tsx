'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  ORGANIZATION_QUERY,
  ONLINE_STORE_SETTINGS_QUERY,
  type IOrganizationData,
  type IOnlineStoreSettingsData,
} from '@/graphql/queries/organization';
import {
  ORGANIZATION_UPDATE,
  ONLINE_STORE_SETTINGS_UPDATE,
  PARTY_CREATE_FOR_ORG,
} from '@/graphql/mutations/organization';
import {
  LANDED_COST_SETTINGS_QUERY,
  type ILandedCostSettingsData,
} from '@/graphql/queries/landedCostSettings';
import { UPDATE_LANDED_COST_SETTINGS } from '@/graphql/mutations/landedCostSettings';
import { useOnboardingStore } from '@/hooks/useOnboardingStore';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

// --- Platform options ---

const PLATFORM_OPTIONS = [
  { value: 'SHOPIFY', label: 'Shopify' },
  { value: 'BIGCOMMERCE', label: 'BigCommerce' },
  { value: 'MAGENTO', label: 'Magento' },
  { value: 'WOOCOMMERCE', label: 'WooCommerce' },
  { value: 'ETSY', label: 'Etsy' },
  { value: 'VOLUSION', label: 'Volusion' },
  { value: 'MIVA', label: 'Miva' },
  { value: 'SALESFORCE', label: 'Salesforce' },
  { value: 'CUSTOM_API', label: 'Custom API' },
  { value: 'OTHER', label: 'Other' },
];

// --- Currency options ---

const CURRENCY_OPTIONS = [
  'AED', 'ARS', 'AUD', 'BDT', 'BGN', 'BHD', 'BRL', 'CAD', 'CHF', 'CLP',
  'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'HKD', 'HRK', 'HUF',
  'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'KWD', 'MXN', 'MYR', 'NGN',
  'NOK', 'NZD', 'PEN', 'PHP', 'PKR', 'PLN', 'QAR', 'RON', 'RUB', 'SAR',
  'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'UAH', 'USD', 'VND', 'ZAR',
].map(c => ({ value: c, label: c }));

// --- Country options ---

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'CN', label: 'China' },
  { value: 'MX', label: 'Mexico' },
  { value: 'JP', label: 'Japan' },
  { value: 'NL', label: 'Netherlands' },
];

// --- Styles ---

const sectionCard: React.CSSProperties = {
  padding: 24,
  background: 'white',
  borderRadius: 8,
  border: '1px solid var(--amino-gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  margin: 0,
  color: 'var(--amino-gray-900)',
};

const sectionDesc: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'var(--amino-gray-500)',
};

const feedbackSuccess: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'var(--amino-green-600)',
};

const feedbackError: React.CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: 'var(--amino-red-600)',
};

const saveRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
};

// --- Component ---

const SHOPIFY_PLAN_LABELS: Record<string, string> = {
  basic: 'Basic',
  grow: 'Grow',
  advanced: 'Advanced',
  plus: 'Plus',
};

export const GeneralSettingsPage = () => {
  const { ecommercePlatform, shopifyPlan } = useOnboardingStore();

  // === Data fetching ===
  const {
    data: orgData,
    error: orgError,
    isLoading: orgLoading,
    mutate: mutateOrg,
  } = useGraphQL<IOrganizationData>({
    query: ORGANIZATION_QUERY,
    schema: 'internal',
  });

  const {
    data: storeData,
    error: storeError,
    isLoading: storeLoading,
    mutate: mutateStore,
  } = useGraphQL<IOnlineStoreSettingsData>({
    query: ONLINE_STORE_SETTINGS_QUERY,
    schema: 'internal',
  });

  const {
    data: lcData,
    error: lcError,
    isLoading: lcLoading,
    mutate: mutateLc,
  } = useGraphQL<ILandedCostSettingsData>({
    query: LANDED_COST_SETTINGS_QUERY,
    schema: 'internal',
  });

  // === Mutations ===
  const { execute: updateOrg } = useGraphQLMutation({
    query: ORGANIZATION_UPDATE,
    schema: 'internal',
  });
  const { execute: updateStoreSettings } = useGraphQLMutation({
    query: ONLINE_STORE_SETTINGS_UPDATE,
    schema: 'internal',
  });
  const { execute: createParty } = useGraphQLMutation<{ partyCreate: { id: string } }>({
    query: PARTY_CREATE_FOR_ORG,
    schema: 'internal',
  });
  const { execute: updateLcSettings } = useGraphQLMutation({
    query: UPDATE_LANDED_COST_SETTINGS,
    schema: 'internal',
  });

  // === Business Details state ===
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [platform, setPlatform] = useState('');
  const [bdSubmitting, setBdSubmitting] = useState(false);
  const [bdError, setBdError] = useState('');
  const [bdSuccess, setBdSuccess] = useState(false);

  // === Currency state ===
  const [currency, setCurrency] = useState('');
  const [curSubmitting, setCurSubmitting] = useState(false);
  const [curError, setCurError] = useState('');
  const [curSuccess, setCurSuccess] = useState(false);

  // === Address state ===
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [locality, setLocality] = useState('');
  const [adminArea, setAdminArea] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [addrSuccess, setAddrSuccess] = useState(false);

  // === Hydrate from API ===
  const org = orgData?.organization;
  const store = storeData?.onlineStoreSettings;
  const lc = lcData?.landedCostSettings;

  useEffect(() => {
    if (org?.name) setBusinessName(org.name);
  }, [org?.name]);

  useEffect(() => {
    if (store?.url) setWebsiteUrl(store.url);
    if (store?.platform) setPlatform(store.platform);
  }, [store?.url, store?.platform]);

  useEffect(() => {
    if (lc?.defaultNativeCurrency) setCurrency(lc.defaultNativeCurrency);
  }, [lc?.defaultNativeCurrency]);

  useEffect(() => {
    const loc = org?.party?.location;
    const person = org?.party?.person;
    if (loc || person) {
      setPhone(person?.phone || '');
      setLine1(loc?.line1 || '');
      setLine2(loc?.line2 || '');
      setLocality(loc?.locality || '');
      setAdminArea(loc?.administrativeAreaCode || '');
      setPostalCode(loc?.postalCode || '');
      setCountryCode(loc?.countryCode || 'US');
    }
  }, [org?.party]);

  // === Dirty checks ===
  const bdDirty =
    businessName.trim() !== (org?.name || '') ||
    websiteUrl.trim() !== (store?.url || '') ||
    platform !== (store?.platform || '');

  const curDirty = currency !== (lc?.defaultNativeCurrency || '');

  // === Handlers ===
  const handleSaveBusinessDetails = async () => {
    if (!businessName.trim()) {
      setBdError('Business name is required.');
      return;
    }
    setBdSubmitting(true);
    setBdError('');
    setBdSuccess(false);

    try {
      await updateOrg({ input: { id: org?.id, name: businessName.trim() } });
      await updateStoreSettings({
        input: {
          ...(websiteUrl.trim() && { url: websiteUrl.trim() }),
          ...(platform && { platform }),
        },
      });
      mutateOrg();
      mutateStore();
      setBdSuccess(true);
      setTimeout(() => setBdSuccess(false), 3000);
    } catch (err) {
      setBdError(err instanceof Error ? err.message : String(err));
    } finally {
      setBdSubmitting(false);
    }
  };

  const handleSaveCurrency = async () => {
    if (!currency) {
      setCurError('Please select a currency.');
      return;
    }
    setCurSubmitting(true);
    setCurError('');
    setCurSuccess(false);

    try {
      await updateLcSettings({ input: { defaultNativeCurrency: currency } });
      mutateLc();
      setCurSuccess(true);
      setTimeout(() => setCurSuccess(false), 3000);
    } catch (err) {
      setCurError(err instanceof Error ? err.message : String(err));
    } finally {
      setCurSubmitting(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!line1.trim() || !locality.trim() || !countryCode) {
      setAddrError('Address line 1, city, and country are required.');
      return;
    }
    setAddrSubmitting(true);
    setAddrError('');
    setAddrSuccess(false);

    try {
      const partyResult = await createParty({
        input: {
          type: 'ORIGIN',
          location: {
            line1: line1.trim(),
            line2: line2.trim() || undefined,
            locality: locality.trim(),
            administrativeAreaCode: adminArea.trim() || undefined,
            postalCode: postalCode.trim(),
            countryCode,
          },
          person: {
            phone: phone.trim() || undefined,
            companyName: org?.name || undefined,
          },
        },
      });

      const partyId = partyResult?.partyCreate?.id;
      if (!partyId) throw new Error('Failed to create address — no party ID returned');

      await updateOrg({ input: { id: org?.id, partyId } });
      mutateOrg();
      setAddrSuccess(true);
      setTimeout(() => setAddrSuccess(false), 3000);
    } catch (err) {
      setAddrError(err instanceof Error ? err.message : String(err));
    } finally {
      setAddrSubmitting(false);
    }
  };

  // === Loading / Error ===
  if (orgLoading || storeLoading || lcLoading) return <LoadingState />;

  const firstError = orgError || storeError || lcError;
  if (firstError) return <ErrorState message={firstError.message || String(firstError)} />;

  // === Render ===
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <Text type="title">General</Text>

      {/* ===== Business Details ===== */}
      <div style={sectionCard}>
        <div>
          <p style={sectionTitle}>Business Details</p>
          <p style={sectionDesc}>
            Core business information for this merchant.
          </p>
        </div>

        <Input
          label="Business Name"
          value={businessName}
          onChange={e => { setBusinessName(e.target.value); setBdSuccess(false); }}
        />

        <Input
          label="Website URL"
          type="url"
          value={websiteUrl}
          onChange={e => { setWebsiteUrl(e.target.value); setBdSuccess(false); }}
          placeholder="https://example.com"
        />

        <Select
          label="E-commerce Platform"
          value={PLATFORM_OPTIONS.find(o => o.value === platform) || null}
          onChange={option => {
            if (option) { setPlatform(option.value); setBdSuccess(false); }
          }}
          options={PLATFORM_OPTIONS}
        />

        {ecommercePlatform === 'shopify' && shopifyPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--amino-gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Shopify Plan
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--amino-gray-900)' }}>
              {SHOPIFY_PLAN_LABELS[shopifyPlan] ?? shopifyPlan}
            </span>
          </div>
        )}

        {bdError && <p style={feedbackError}>{bdError}</p>}
        {bdSuccess && <p style={feedbackSuccess}>Business details saved.</p>}

        <div style={saveRow}>
          <Button
            variant="primary"
            onClick={handleSaveBusinessDetails}
            loading={bdSubmitting}
            disabled={!bdDirty}
          >
            Save
          </Button>
        </div>
      </div>

      {/* ===== Default Native Currency ===== */}
      <div style={sectionCard}>
        <div>
          <p style={sectionTitle}>Default native currency</p>
          <p style={sectionDesc}>
            Set the default currency for landed cost calculations and USD conversion.
          </p>
        </div>

        <div style={{ maxWidth: 300 }}>
          <Select
            label="Currency"
            value={CURRENCY_OPTIONS.find(o => o.value === currency) || null}
            onChange={option => {
              if (option) { setCurrency(option.value); setCurSuccess(false); }
            }}
            options={CURRENCY_OPTIONS}
          />
        </div>

        {curError && <p style={feedbackError}>{curError}</p>}
        {curSuccess && <p style={feedbackSuccess}>Default currency saved.</p>}

        <div style={saveRow}>
          <Button
            variant="primary"
            onClick={handleSaveCurrency}
            loading={curSubmitting}
            disabled={!curDirty}
          >
            Save
          </Button>
        </div>
      </div>

      {/* ===== Business Address ===== */}
      <div style={sectionCard}>
        <div>
          <p style={sectionTitle}>Business address</p>
          <p style={sectionDesc}>
            Physical business address. Used for shipping origin and compliance.
          </p>
        </div>

        <Input
          label="Phone"
          value={phone}
          onChange={e => { setPhone(e.target.value); setAddrSuccess(false); }}
        />

        <Input
          label="Address Line 1"
          value={line1}
          onChange={e => { setLine1(e.target.value); setAddrSuccess(false); }}
        />

        <Input
          label="Address Line 2"
          value={line2}
          onChange={e => { setLine2(e.target.value); setAddrSuccess(false); }}
          placeholder="Optional"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Input
            label="City"
            value={locality}
            onChange={e => { setLocality(e.target.value); setAddrSuccess(false); }}
          />
          <Input
            label="State / Province"
            value={adminArea}
            onChange={e => { setAdminArea(e.target.value); setAddrSuccess(false); }}
          />
          <Input
            label="Postal Code"
            value={postalCode}
            onChange={e => { setPostalCode(e.target.value); setAddrSuccess(false); }}
          />
        </div>

        <div style={{ maxWidth: 300 }}>
          <Select
            label="Country"
            value={COUNTRY_OPTIONS.find(o => o.value === countryCode) || null}
            onChange={option => {
              if (option) { setCountryCode(option.value); setAddrSuccess(false); }
            }}
            options={COUNTRY_OPTIONS}
          />
        </div>

        {addrError && <p style={feedbackError}>{addrError}</p>}
        {addrSuccess && <p style={feedbackSuccess}>Business address saved.</p>}

        <div style={saveRow}>
          <Button
            variant="primary"
            onClick={handleSaveAddress}
            loading={addrSubmitting}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

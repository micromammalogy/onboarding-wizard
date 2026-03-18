'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { Switch } from '@zonos/amino/components/switch/Switch';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  LANDED_COST_SETTINGS_QUERY,
  type ILandedCostSettingsData,
} from '@/graphql/queries/landedCostSettings';
import { UPDATE_LANDED_COST_SETTINGS } from '@/graphql/mutations/landedCostSettings';
import { TaskGuidanceBanner } from '@/components/wizard/TaskGuidanceBanner';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const sectionCard: React.CSSProperties = {
  padding: 24,
  background: 'white',
  borderRadius: 8,
  border: '1px solid var(--amino-gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: 24,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
  color: 'var(--amino-gray-900)',
  paddingBottom: 8,
  borderBottom: '1px solid var(--amino-gray-100)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 24,
};

const rowLabel: React.CSSProperties = { flex: 1 };
const rowControl: React.CSSProperties = { flexShrink: 0 };

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CN', label: 'China' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'DE', label: 'Germany' },
  { value: 'JP', label: 'Japan' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'KR', label: 'South Korea' },
  { value: 'IN', label: 'India' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Turkey' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'PK', label: 'Pakistan' },
].sort((a, b) => a.label.localeCompare(b.label));

type IFormState = {
  defaultCountryOfOrigin: string;
  defaultHsCode: string;
  defaultCustomsDescription: string;
  landedCostGuarantee: boolean;
};

export const CatalogSettingsPage = () => {
  const [form, setForm] = useState<IFormState>({
    defaultCountryOfOrigin: '',
    defaultHsCode: '',
    defaultCustomsDescription: '',
    landedCostGuarantee: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<ILandedCostSettingsData>({
    query: LANDED_COST_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: UPDATE_LANDED_COST_SETTINGS,
    schema: 'internal',
  });

  useEffect(() => {
    if (data?.landedCostSettings) {
      const s = data.landedCostSettings;
      setForm({
        defaultCountryOfOrigin: s.defaultCountryOfOrigin || '',
        defaultHsCode: s.defaultHarmonizedCode || '',
        defaultCustomsDescription: s.defaultCustomsDescription || '',
        landedCostGuarantee: s.landedCostGuarantee === 'ENABLED',
      });
    }
  }, [data]);

  const update = useCallback(<K extends keyof IFormState>(key: K, value: IFormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setSuccess(false);
  }, []);

  const handleSave = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      await updateSettings({
        input: {
          defaultCountryOfOrigin: form.defaultCountryOfOrigin || undefined,
          defaultHarmonizedCode: form.defaultHsCode || undefined,
          defaultCustomsDescription: form.defaultCustomsDescription.trim() || undefined,
          landedCostGuarantee: form.landedCostGuarantee ? 'ENABLED' : 'DISABLED',
        },
      });

      mutate();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="title">Catalog</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-500)' }}>
        Configure how Zonos and Customs should reference your product catalog.
      </p>

      <TaskGuidanceBanner
        taskId="catalog"
        title="Confirm your catalog defaults"
        description="Set your fallback country of origin (where your products are manufactured) and fallback HS code (used for customs classification when no product-level code is provided)."
      />

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Catalog settings saved.</p>}

      <div style={sectionCard}>
        <p style={sectionTitle}>Catalog</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Fallback country of origin</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Where are your products manufactured?
          </p>
          <div style={{ marginTop: 12 }}>
            <Select
              label="Country of origin"
              value={COUNTRY_OPTIONS.find(o => o.value === form.defaultCountryOfOrigin) || null}
              onChange={o => update('defaultCountryOfOrigin', o?.value || '')}
              options={COUNTRY_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>Customs</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Fallback HS code</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            The classification to use when none are provided.
          </p>
          <div style={{ marginTop: 12 }}>
            <Input
              label="HS code"
              value={form.defaultHsCode}
              onChange={e => update('defaultHsCode', e.target.value)}
              placeholder="e.g. 6109.10"
            />
          </div>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Default customs description</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            A fallback customs description for your products.
          </p>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Customs description"
              value={form.defaultCustomsDescription}
              onChange={e => update('defaultCustomsDescription', e.target.value)}
              placeholder="e.g. General merchandise"
            />
          </div>
        </div>
      </div>

      <div style={sectionCard}>
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Landed Cost Guarantee</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Enable Landed Cost Guarantee to protect against unexpected duties and taxes.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.landedCostGuarantee}
              onChange={checked => update('landedCostGuarantee', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

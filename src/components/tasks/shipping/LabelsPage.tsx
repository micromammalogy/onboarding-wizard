'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { Switch } from '@zonos/amino/components/switch/Switch';
import { Input } from '@zonos/amino/components/input/Input';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  LABEL_SETTINGS_QUERY,
  type ILabelSettingsData,
} from '@/graphql/queries/labelSettings';
import { LABEL_SETTINGS_UPDATE } from '@/graphql/mutations/labelSettings';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const LABEL_SIZE_OPTIONS = [
  { value: 'FOUR_BY_SIX', label: '4" x 6"' },
  { value: 'EIGHT_BY_ELEVEN', label: '8.5" x 11"' },
];

const LABEL_FILE_TYPE_OPTIONS = [
  { value: 'PDF', label: 'PDF' },
  { value: 'PNG', label: 'PNG' },
  { value: 'ZPL', label: 'ZPL' },
];

const SHIPPING_PAYMENT_OPTIONS = [
  { value: 'SENDER', label: 'Sender' },
  { value: 'THIRD_PARTY', label: 'Third party' },
];

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

type IFormState = {
  labelSize: string;
  labelFileType: string;
  signatureRequired: boolean;
  shippingPayment: string;
  descriptionOverride: string;
};

const EMPTY_FORM: IFormState = {
  labelSize: 'FOUR_BY_SIX',
  labelFileType: 'PDF',
  signatureRequired: false,
  shippingPayment: 'SENDER',
  descriptionOverride: '',
};

export const LabelsPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<ILabelSettingsData>({
    query: LABEL_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: LABEL_SETTINGS_UPDATE,
    schema: 'internal',
  });

  const settings = data?.labelSettings;

  useEffect(() => {
    if (settings) {
      setForm({
        labelSize: settings.labelSize || 'FOUR_BY_SIX',
        labelFileType: settings.labelFileType || 'PDF',
        signatureRequired: settings.signatureRequired || false,
        shippingPayment: settings.shippingPayment || 'SENDER',
        descriptionOverride: settings.descriptionOverride?.overrideValue || '',
      });
    }
  }, [settings]);

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
          labelSize: form.labelSize,
          labelFileType: form.labelFileType,
          signatureRequired: form.signatureRequired,
          shippingPayment: form.shippingPayment,
          ...(form.descriptionOverride
            ? { descriptionOverride: { overrideValue: form.descriptionOverride, scope: 'ALL' } }
            : {}),
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
        <Text type="title">Label Settings</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Label settings saved.</p>}

      <div style={sectionCard}>
        <p style={sectionTitle}>Preferences</p>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Label size</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Select the default label size for printing.
            </p>
          </div>
          <div style={{ ...rowControl, width: 160 }}>
            <Select
              label=""
              value={LABEL_SIZE_OPTIONS.find(o => o.value === form.labelSize) || null}
              onChange={o => { if (o) update('labelSize', o.value); }}
              options={LABEL_SIZE_OPTIONS}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Label file type</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Select the file format for generated labels.
            </p>
          </div>
          <div style={{ ...rowControl, width: 120 }}>
            <Select
              label=""
              value={LABEL_FILE_TYPE_OPTIONS.find(o => o.value === form.labelFileType) || null}
              onChange={o => { if (o) update('labelFileType', o.value); }}
              options={LABEL_FILE_TYPE_OPTIONS}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Signature required</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Require a signature on delivery for all shipments.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.signatureRequired}
              onChange={checked => update('signatureRequired', checked)}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Shipping payment</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Select who pays for shipping charges.
            </p>
          </div>
          <div style={{ ...rowControl, width: 160 }}>
            <Select
              label=""
              value={SHIPPING_PAYMENT_OPTIONS.find(o => o.value === form.shippingPayment) || null}
              onChange={o => { if (o) update('shippingPayment', o.value); }}
              options={SHIPPING_PAYMENT_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>Customization</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Description override</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Override the customs description on all labels with a custom value.
          </p>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Custom description"
              value={form.descriptionOverride}
              onChange={e => update('descriptionOverride', e.target.value)}
              placeholder="e.g. General merchandise"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

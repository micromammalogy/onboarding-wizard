'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Text } from '@zonos/amino/components/text/Text';
import { Switch } from '@zonos/amino/components/switch/Switch';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  PACKING_SLIP_SETTINGS_QUERY,
  type IPackingSlipSettingsData,
} from '@/graphql/queries/packingSlipSettings';
import { PACKING_SLIP_SETTINGS_UPDATE } from '@/graphql/mutations/packingSlipSettings';
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

const PAGE_SIZE_OPTIONS = [
  { value: 'FOUR_BY_SIX', label: '4" x 6"' },
  { value: 'EIGHT_BY_ELEVEN', label: '8.5" x 11"' },
];

type IFormState = {
  headerText: string;
  footerText: string;
  customNotes: string;
  pageSize: string;
  showItemImages: boolean;
  showItemPrices: boolean;
  showOrderTotal: boolean;
  includeBarcodeOrderId: boolean;
  includeBarcodeShipmentId: boolean;
  includeBarcodeTracking: boolean;
};

const EMPTY_FORM: IFormState = {
  headerText: '',
  footerText: '',
  customNotes: '',
  pageSize: 'FOUR_BY_SIX',
  showItemImages: true,
  showItemPrices: true,
  showOrderTotal: true,
  includeBarcodeOrderId: false,
  includeBarcodeShipmentId: false,
  includeBarcodeTracking: false,
};

export const PackingSlipsPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IPackingSlipSettingsData>({
    query: PACKING_SLIP_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: PACKING_SLIP_SETTINGS_UPDATE,
    schema: 'internal',
  });

  const settings = data?.packingSlipSettings;

  useEffect(() => {
    if (settings) {
      setForm({
        headerText: settings.headerText || '',
        footerText: settings.footerText || '',
        customNotes: settings.customNotes || '',
        pageSize: settings.pageSize || 'FOUR_BY_SIX',
        showItemImages: settings.showItemImages ?? true,
        showItemPrices: settings.showItemPrices ?? true,
        showOrderTotal: settings.showOrderTotal ?? true,
        includeBarcodeOrderId: settings.includeBarcodeOrderId ?? false,
        includeBarcodeShipmentId: settings.includeBarcodeShipmentId ?? false,
        includeBarcodeTracking: settings.includeBarcodeTracking ?? false,
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
          headerText: form.headerText,
          footerText: form.footerText,
          customNotes: form.customNotes,
          pageSize: form.pageSize,
          showItemImages: form.showItemImages,
          showItemPrices: form.showItemPrices,
          showOrderTotal: form.showOrderTotal,
          includeBarcodeOrderId: form.includeBarcodeOrderId,
          includeBarcodeShipmentId: form.includeBarcodeShipmentId,
          includeBarcodeTracking: form.includeBarcodeTracking,
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
        <Text type="title">Packing Slip Settings</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Packing slip settings saved.</p>}

      <div style={sectionCard}>
        <p style={sectionTitle}>Page size</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {PAGE_SIZE_OPTIONS.map(opt => (
            <label
              key={opt.value}
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: 8,
                border: `2px solid ${form.pageSize === opt.value ? 'var(--amino-blue-500)' : 'var(--amino-gray-200)'}`,
                background: form.pageSize === opt.value ? 'var(--amino-blue-50)' : 'white',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <input
                type="radio"
                name="pageSize"
                value={opt.value}
                checked={form.pageSize === opt.value}
                onChange={() => update('pageSize', opt.value)}
                style={{ display: 'none' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>Content</p>

        <div>
          <Input
            label="Header text"
            value={form.headerText}
            onChange={e => update('headerText', e.target.value)}
            placeholder="Text shown at the top of the packing slip"
          />
        </div>

        <div>
          <Input
            label="Footer text"
            value={form.footerText}
            onChange={e => update('footerText', e.target.value)}
            placeholder="Text shown at the bottom of the packing slip"
          />
        </div>

        <div>
          <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 500 }}>Custom notes</p>
          <textarea
            value={form.customNotes}
            onChange={e => update('customNotes', e.target.value)}
            placeholder="Additional notes to include on packing slips"
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--amino-gray-300)',
              borderRadius: 6,
              fontSize: 13,
              resize: 'vertical',
            }}
          />
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>Display options</p>

        {([
          ['showItemImages', 'Show item images', 'Display product images on packing slips.'],
          ['showItemPrices', 'Show item prices', 'Display item prices on packing slips.'],
          ['showOrderTotal', 'Show order total', 'Display the order total on packing slips.'],
        ] as const).map(([key, label, desc]) => (
          <div key={key} style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>{desc}</p>
            </div>
            <div style={rowControl}>
              <Switch checked={form[key]} onChange={checked => update(key, checked)} />
            </div>
          </div>
        ))}
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>Barcodes</p>

        {([
          ['includeBarcodeOrderId', 'Order ID barcode', 'Include a barcode for the order ID.'],
          ['includeBarcodeShipmentId', 'Shipment ID barcode', 'Include a barcode for the shipment ID.'],
          ['includeBarcodeTracking', 'Tracking barcode', 'Include a barcode for the tracking number.'],
        ] as const).map(([key, label, desc]) => (
          <div key={key} style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>{desc}</p>
            </div>
            <div style={rowControl}>
              <Switch checked={form[key]} onChange={checked => update(key, checked)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { Switch } from '@zonos/amino/components/switch/Switch';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  CLASSIFY_SETTINGS_QUERY,
  type IClassifySettingsData,
} from '@/graphql/queries/classifySettings';
import { CLASSIFY_SETTINGS_UPDATE } from '@/graphql/mutations/classifySettings';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const CONFIDENCE_OPTIONS = [
  { value: 0.9, label: 'Highest confidence' },
  { value: 0.8, label: 'High confidence' },
  { value: 0.7, label: 'Medium confidence' },
  { value: 0.6, label: 'Low confidence' },
  { value: 0.5, label: 'Lowest confidence' },
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
  classifyOnTheFly: boolean;
  minimumConfidence: number;
  metaDescription: string;
};

export const ClassifySettingsPage = () => {
  const [form, setForm] = useState<IFormState>({
    classifyOnTheFly: true,
    minimumConfidence: 0.7,
    metaDescription: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IClassifySettingsData>({
    query: CLASSIFY_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: CLASSIFY_SETTINGS_UPDATE,
    schema: 'internal',
  });

  useEffect(() => {
    if (data) {
      setForm({
        classifyOnTheFly: data.itemSetting?.classifyMissingHsCodes === 'ENABLED',
        minimumConfidence: data.itemSetting?.minimumConfidenceThreshold ?? 0.7,
        metaDescription: data.classificationSetting?.marketProfile || '',
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
        inputItemSettings: {
          classifyMissingHsCodes: form.classifyOnTheFly ? 'ENABLED' : 'DISABLED',
          minimumConfidenceThreshold: form.minimumConfidence,
        },
        inputClassificationSettings: {
          marketProfile: form.metaDescription || null,
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
        <Text type="title">Classify</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-500)' }}>
        Manage your Classify on the fly preferences.
      </p>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Classify settings saved.</p>}

      <div style={sectionCard}>
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Enable Classify on the fly</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Automatically generate a product-specific HS code when one is not provided at checkout.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.classifyOnTheFly}
              onChange={checked => update('classifyOnTheFly', checked)}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Minimum confidence score</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Set the minimum confidence score threshold. If the score falls below your chosen threshold,
              Classify will default to your fallback HS code.
            </p>
          </div>
          <div style={{ ...rowControl, width: 200 }}>
            <Select
              label=""
              value={CONFIDENCE_OPTIONS.find(o => o.value === form.minimumConfidence) || CONFIDENCE_OPTIONS[2]}
              onChange={o => { if (o) update('minimumConfidence', o.value); }}
              options={CONFIDENCE_OPTIONS}
            />
          </div>
        </div>
      </div>

      <div style={sectionCard}>
        <p style={sectionTitle}>Meta description</p>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
          Use a meta description to improve product classification when specific product details are missing.
          Leave empty to disable this feature.
        </p>
        <textarea
          value={form.metaDescription}
          onChange={e => update('metaDescription', e.target.value)}
          placeholder="E.g., Hydrate your skin with our premium moisturizer, enriched with natural ingredients for all-day softness."
          rows={4}
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
  );
};

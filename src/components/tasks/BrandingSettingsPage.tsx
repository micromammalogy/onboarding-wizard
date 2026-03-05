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
  APPEARANCE_SETTINGS_QUERY,
  type IAppearanceSettingsData,
} from '@/graphql/queries/appearanceSettings';
import { APPEARANCE_SETTINGS_UPDATE } from '@/graphql/mutations/appearanceSettings';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const STYLE_OPTIONS = [
  { value: 'ROUNDED', label: 'Rounded' },
  { value: 'SHARP', label: 'Sharp' },
];

const THEME_OPTIONS = [
  { value: 'LIGHT', label: 'Light' },
  { value: 'DARK', label: 'Dark' },
  { value: 'SYSTEM', label: 'System' },
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

const rowLabel: React.CSSProperties = {
  flex: 1,
};

const rowControl: React.CSSProperties = {
  flexShrink: 0,
};

type IFormState = {
  colorPrimary: string;
  colorSecondary: string;
  fontFamily: string;
  logoUrl: string;
  style: string;
  theme: string;
  zonosAttribution: 'ENABLED' | 'DISABLED';
};

const EMPTY_FORM: IFormState = {
  colorPrimary: '#000000',
  colorSecondary: '#000000',
  fontFamily: '',
  logoUrl: '',
  style: 'ROUNDED',
  theme: 'LIGHT',
  zonosAttribution: 'ENABLED',
};

export const BrandingSettingsPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IAppearanceSettingsData>({
    query: APPEARANCE_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: APPEARANCE_SETTINGS_UPDATE,
    schema: 'internal',
  });

  const appearance = data?.appearanceSettings;

  useEffect(() => {
    if (appearance) {
      setForm({
        colorPrimary: appearance.colorPrimary || '#000000',
        colorSecondary: appearance.colorSecondary || '#000000',
        fontFamily: appearance.fontFamily || '',
        logoUrl: appearance.logoUrl || '',
        style: appearance.style || 'ROUNDED',
        theme: appearance.theme || 'LIGHT',
        zonosAttribution: appearance.zonosAttribution || 'ENABLED',
      });
    }
  }, [appearance]);

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
          colorPrimary: form.colorPrimary,
          colorSecondary: form.colorSecondary,
          fontFamily: form.fontFamily || undefined,
          logoUrl: form.logoUrl || undefined,
          style: form.style,
          theme: form.theme,
          zonosAttribution: form.zonosAttribution,
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
        <Text type="title">Branding Settings</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Branding settings saved.</p>}

      {/* ===== Theme ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Theme</p>

        {/* Logo URL */}
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Logo</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Your brand logo URL. Used in checkout and Hello.
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {form.logoUrl && (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  border: '1px solid var(--amino-gray-200)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--amino-gray-50)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <Input
                label="Logo URL"
                value={form.logoUrl}
                onChange={e => update('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Primary Color */}
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Brand color</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Your primary brand color.
            </p>
          </div>
          <div style={{ ...rowControl, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={form.colorPrimary}
              onChange={e => update('colorPrimary', e.target.value)}
              style={{
                width: 36,
                height: 36,
                border: '1px solid var(--amino-gray-300)',
                borderRadius: 6,
                padding: 2,
                cursor: 'pointer',
              }}
            />
            <Input
              label=""
              value={form.colorPrimary}
              onChange={e => update('colorPrimary', e.target.value)}
              style={{ width: 100 }}
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Accent color</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Your secondary accent color.
            </p>
          </div>
          <div style={{ ...rowControl, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="color"
              value={form.colorSecondary}
              onChange={e => update('colorSecondary', e.target.value)}
              style={{
                width: 36,
                height: 36,
                border: '1px solid var(--amino-gray-300)',
                borderRadius: 6,
                padding: 2,
                cursor: 'pointer',
              }}
            />
            <Input
              label=""
              value={form.colorSecondary}
              onChange={e => update('colorSecondary', e.target.value)}
              style={{ width: 100 }}
            />
          </div>
        </div>
      </div>

      {/* ===== Checkout ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Checkout</p>

        {/* Theme */}
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Theme</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Select the default color scheme for customer facing elements.
            </p>
          </div>
          <div style={{ ...rowControl, width: 160 }}>
            <Select
              label=""
              value={THEME_OPTIONS.find(o => o.value === form.theme) || null}
              onChange={o => { if (o) update('theme', o.value); }}
              options={THEME_OPTIONS}
            />
          </div>
        </div>

        {/* Style */}
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Style</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Select the border style for the checkout interface.
            </p>
          </div>
          <div style={{ ...rowControl, width: 160 }}>
            <Select
              label=""
              value={STYLE_OPTIONS.find(o => o.value === form.style) || null}
              onChange={o => { if (o) update('style', o.value); }}
              options={STYLE_OPTIONS}
            />
          </div>
        </div>

        {/* Font */}
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Font</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Enter a Google Font family name for the checkout interface.
          </p>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Font family"
              value={form.fontFamily}
              onChange={e => update('fontFamily', e.target.value)}
              placeholder="e.g. Inter, Roboto, Open Sans"
            />
          </div>
        </div>

        {/* Zonos Attribution */}
        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Zonos attribution</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Show or hide the &quot;Powered by Zonos&quot; branding in checkout.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.zonosAttribution === 'ENABLED'}
              onChange={checked => update('zonosAttribution', checked ? 'ENABLED' : 'DISABLED')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

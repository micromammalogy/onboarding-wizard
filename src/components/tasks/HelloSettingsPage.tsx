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
  HELLO_SETTINGS_QUERY,
  type IHelloSettingsData,
} from '@/graphql/queries/helloSettings';
import { HELLO_SETTINGS_UPDATE } from '@/graphql/mutations/helloSettings';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const MOBILE_LOCATION_OPTIONS = [
  { value: 'BOTTOM_RIGHT', label: 'Bottom right' },
  { value: 'BOTTOM_LEFT', label: 'Bottom left' },
  { value: 'TOP_RIGHT', label: 'Top right' },
  { value: 'TOP_LEFT', label: 'Top left' },
];

const URL_TABS = ['Home page', 'Product list', 'Product detail', 'Cart'] as const;
const URL_FIELDS = ['homepageUrlPattern', 'productListUrlPattern', 'productDetailUrlPattern', 'cartUrlPattern'] as const;

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
  peekMessageBehavior: 'ENABLED' | 'DISABLED';
  mobileLocation: string;
  peekMessageDelay: string;
  anchorElementSelector: string;
  currencyBehavior: 'ENABLED' | 'DISABLED';
  currencyElementSelector: string;
  restrictionBehavior: 'DISABLED' | 'RESTRICT_AND_BLOCK' | 'RESTRICT_AND_WARN';
  productTitleElementSelector: string;
  productDescriptionElementSelector: string;
  productAddToCartElementSelector: string;
  homepageUrlPattern: string;
  productListUrlPattern: string;
  productDetailUrlPattern: string;
  cartUrlPattern: string;
  excludedUrlPatterns: string;
  allowedDomains: string;
};

const EMPTY_FORM: IFormState = {
  peekMessageBehavior: 'DISABLED',
  mobileLocation: 'BOTTOM_RIGHT',
  peekMessageDelay: '3',
  anchorElementSelector: '',
  currencyBehavior: 'DISABLED',
  currencyElementSelector: '',
  restrictionBehavior: 'DISABLED',
  productTitleElementSelector: '',
  productDescriptionElementSelector: '',
  productAddToCartElementSelector: '',
  homepageUrlPattern: '',
  productListUrlPattern: '',
  productDetailUrlPattern: '',
  cartUrlPattern: '',
  excludedUrlPatterns: '',
  allowedDomains: '',
};

export const HelloSettingsPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [activeUrlTab, setActiveUrlTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IHelloSettingsData>({
    query: HELLO_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: HELLO_SETTINGS_UPDATE,
    schema: 'internal',
  });

  const hello = data?.helloSettings;
  const storeDomains = data?.onlineStoreSettings?.allowedDomains;

  useEffect(() => {
    if (hello) {
      setForm({
        peekMessageBehavior: hello.peekMessageBehavior,
        mobileLocation: hello.mobileLocation,
        peekMessageDelay: String(hello.peekMessageDelay ?? 3),
        anchorElementSelector: hello.anchorElementSelector || '',
        currencyBehavior: hello.currencyBehavior,
        currencyElementSelector: hello.currencyElementSelector || '',
        restrictionBehavior: hello.restrictionBehavior,
        productTitleElementSelector: hello.productTitleElementSelector || '',
        productDescriptionElementSelector: hello.productDescriptionElementSelector || '',
        productAddToCartElementSelector: hello.productAddToCartElementSelector || '',
        homepageUrlPattern: hello.homepageUrlPattern || '',
        productListUrlPattern: hello.productListUrlPattern || '',
        productDetailUrlPattern: hello.productDetailUrlPattern || '',
        cartUrlPattern: hello.cartUrlPattern || '',
        excludedUrlPatterns: (hello.excludedUrlPatterns || []).join('\n'),
        allowedDomains: (storeDomains || []).join('\n'),
      });
    }
  }, [hello, storeDomains]);

  const update = useCallback(<K extends keyof IFormState>(key: K, value: IFormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setSuccess(false);
  }, []);

  const handleSave = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      const excluded = form.excludedUrlPatterns.split('\n').map(s => s.trim()).filter(Boolean);
      const domains = form.allowedDomains.split('\n').map(s => s.trim()).filter(Boolean);

      await updateSettings({
        input: {
          peekMessageBehavior: form.peekMessageBehavior,
          mobileLocation: form.mobileLocation,
          peekMessageDelay: parseFloat(form.peekMessageDelay) || 3,
          anchorElementSelector: form.anchorElementSelector,
          currencyBehavior: form.currencyBehavior,
          currencyElementSelector: form.currencyElementSelector,
          dutyTaxEstimationBehavior: 'DISABLED',
          restrictionBehavior: form.restrictionBehavior,
          productTitleElementSelector: form.productTitleElementSelector || undefined,
          productDescriptionElementSelector: form.productDescriptionElementSelector || undefined,
          productAddToCartElementSelector: form.productAddToCartElementSelector || undefined,
          homepageUrlPattern: form.homepageUrlPattern || undefined,
          productListUrlPattern: form.productListUrlPattern || undefined,
          productDetailUrlPattern: form.productDetailUrlPattern || undefined,
          cartUrlPattern: form.cartUrlPattern || undefined,
          excludedUrlPatterns: excluded,
        },
        allowedDomains: domains,
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

  const restrictionsEnabled = form.restrictionBehavior !== 'DISABLED';
  const currencyEnabled = form.currencyBehavior === 'ENABLED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="title">Hello Settings</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Hello settings saved.</p>}

      {/* ===== Display ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Display</p>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Peek messages</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Turn peek messages on and off.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.peekMessageBehavior === 'ENABLED'}
              onChange={checked => update('peekMessageBehavior', checked ? 'ENABLED' : 'DISABLED')}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Mobile location</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Select the best spot for Hello to appear on mobile devices.
            </p>
          </div>
          <div style={{ ...rowControl, width: 180 }}>
            <Select
              label=""
              value={MOBILE_LOCATION_OPTIONS.find(o => o.value === form.mobileLocation) || null}
              onChange={o => { if (o) update('mobileLocation', o.value); }}
              options={MOBILE_LOCATION_OPTIONS}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Peek message delay</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Control, in seconds, how quickly peek messages display.
            </p>
          </div>
          <div style={{ ...rowControl, width: 80 }}>
            <Input
              label=""
              type="number"
              value={form.peekMessageDelay}
              onChange={e => update('peekMessageDelay', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ===== Behavior ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Behavior</p>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Hello anchor element</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Enter the HTML element where Hello will be inserted into your site.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Enter a CSS selector #id or .class"
              value={form.anchorElementSelector}
              onChange={e => update('anchorElementSelector', e.target.value)}
            />
          </div>
        </div>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Currency behavior</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Toggle on to convert currency and off to not have currency converted.
              </p>
            </div>
            <div style={rowControl}>
              <Switch
                checked={currencyEnabled}
                onChange={checked => update('currencyBehavior', checked ? 'ENABLED' : 'DISABLED')}
              />
            </div>
          </div>
          {currencyEnabled && (
            <div style={{ marginTop: 12 }}>
              <Input
                label="Enter a CSS selector #id or .class"
                value={form.currencyElementSelector}
                onChange={e => update('currencyElementSelector', e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Item restrictions</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Verify if items being shipped are restricted from export or import.
              </p>
            </div>
            <div style={rowControl}>
              <Switch
                checked={restrictionsEnabled}
                onChange={checked =>
                  update('restrictionBehavior', checked ? 'RESTRICT_AND_BLOCK' : 'DISABLED')
                }
              />
            </div>
          </div>
          {restrictionsEnabled && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {(['RESTRICT_AND_BLOCK', 'RESTRICT_AND_WARN'] as const).map(val => (
                  <label
                    key={val}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: `2px solid ${form.restrictionBehavior === val ? 'var(--amino-blue-500)' : 'var(--amino-gray-200)'}`,
                      background: form.restrictionBehavior === val ? 'var(--amino-blue-50)' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <input
                      type="radio"
                      name="restrictionBehavior"
                      checked={form.restrictionBehavior === val}
                      onChange={() => update('restrictionBehavior', val)}
                    />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>
                      {val === 'RESTRICT_AND_BLOCK' ? 'Prevent adding to cart' : 'Warn of restriction only'}
                    </span>
                  </label>
                ))}
              </div>
              <Input
                label="Product title selector"
                value={form.productTitleElementSelector}
                onChange={e => update('productTitleElementSelector', e.target.value)}
                placeholder=".title or #title"
              />
              <Input
                label="Product description selector"
                value={form.productDescriptionElementSelector}
                onChange={e => update('productDescriptionElementSelector', e.target.value)}
                placeholder=".description or #description"
              />
              <Input
                label="Add to cart button selector"
                value={form.productAddToCartElementSelector}
                onChange={e => update('productAddToCartElementSelector', e.target.value)}
                placeholder=".add-to-cart or #add-to-cart"
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== URLs ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>URLs</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Page URL patterns</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Enter regex patterns to match each type of page on your site.
          </p>
          <div style={{ display: 'flex', gap: 0, marginTop: 12, borderBottom: '1px solid var(--amino-gray-200)' }}>
            {URL_TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveUrlTab(i)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: activeUrlTab === i ? 600 : 400,
                  color: activeUrlTab === i ? 'var(--amino-blue-600)' : 'var(--amino-gray-500)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeUrlTab === i ? '2px solid var(--amino-blue-600)' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <textarea
              value={form[URL_FIELDS[activeUrlTab]]}
              onChange={e => update(URL_FIELDS[activeUrlTab], e.target.value)}
              placeholder="Enter regex pattern..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--amino-gray-300)',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Excluded URL patterns</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Enter regex patterns to match pages where Hello should not appear. One per line.
          </p>
          <div style={{ marginTop: 8 }}>
            <textarea
              value={form.excludedUrlPatterns}
              onChange={e => update('excludedUrlPatterns', e.target.value)}
              placeholder="One pattern per line..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--amino-gray-300)',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
          </div>
        </div>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Allowed domains</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Enter URLs where you plan to use Hello, one per line. Shared with Checkout.
          </p>
          <div style={{ marginTop: 8 }}>
            <textarea
              value={form.allowedDomains}
              onChange={e => update('allowedDomains', e.target.value)}
              placeholder="https://example.com"
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--amino-gray-300)',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'monospace',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

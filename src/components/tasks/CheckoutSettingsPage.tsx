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
  CHECKOUT_SETTINGS_QUERY,
  type ICheckoutSettingsData,
} from '@/graphql/queries/checkoutSettings';
import { CHECKOUT_SETTINGS_UPDATE } from '@/graphql/mutations/checkoutSettings';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const SUCCESS_BEHAVIOR_OPTIONS = [
  { value: 'ZONOS_SUCCESS_PAGE', label: 'Show Zonos success page (recommended)' },
  { value: 'REDIRECT_TO_SUCCESS_PAGE', label: 'Redirect to a success page' },
  { value: 'CLOSE_MODAL', label: 'Close the checkout modal' },
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
  placeOrderButtonSelector: string;
  companyFieldsStatus: 'ENABLED' | 'DISABLED';
  orderCombinationRefundDistributionStatus: 'ENABLED' | 'DISABLED';
  orderNotificationsActive: 'ENABLED' | 'DISABLED';
  orderNotificationsCopies: string;
  orderShippedActive: 'ENABLED' | 'DISABLED';
  orderShippedCopies: string;
  orderCancelledActive: 'ENABLED' | 'DISABLED';
  orderCancelledCopies: string;
  successBehavior: string;
  successRedirectUrl: string;
  allowedDomains: string;
};

const EMPTY_FORM: IFormState = {
  placeOrderButtonSelector: '',
  companyFieldsStatus: 'DISABLED',
  orderCombinationRefundDistributionStatus: 'DISABLED',
  orderNotificationsActive: 'DISABLED',
  orderNotificationsCopies: '',
  orderShippedActive: 'DISABLED',
  orderShippedCopies: '',
  orderCancelledActive: 'DISABLED',
  orderCancelledCopies: '',
  successBehavior: 'ZONOS_SUCCESS_PAGE',
  successRedirectUrl: '',
  allowedDomains: '',
};

export const CheckoutSettingsPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<ICheckoutSettingsData>({
    query: CHECKOUT_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: CHECKOUT_SETTINGS_UPDATE,
    schema: 'internal',
  });

  const checkout = data?.checkoutSettings;
  const storeDomains = data?.onlineStoreSettings?.allowedDomains;

  useEffect(() => {
    if (checkout) {
      const notifs = checkout.orderNotifications;
      setForm({
        placeOrderButtonSelector: checkout.placeOrderButtonSelector || '',
        companyFieldsStatus: checkout.companyFieldsStatus,
        orderCombinationRefundDistributionStatus: checkout.orderCombinationRefundDistributionStatus,
        orderNotificationsActive: notifs?.merchantOrderConfirmation?.active || 'DISABLED',
        orderNotificationsCopies: (notifs?.merchantOrderConfirmation?.sendCopiesTo || []).join(', '),
        orderShippedActive: notifs?.orderShipped?.active || 'DISABLED',
        orderShippedCopies: (notifs?.orderShipped?.sendCopiesTo || []).join(', '),
        orderCancelledActive: notifs?.orderCancelled?.active || 'DISABLED',
        orderCancelledCopies: (notifs?.orderCancelled?.sendCopiesTo || []).join(', '),
        successBehavior: checkout.successBehavior,
        successRedirectUrl: checkout.successRedirectUrl || '',
        allowedDomains: (storeDomains || []).join('\n'),
      });
    }
  }, [checkout, storeDomains]);

  const update = useCallback(<K extends keyof IFormState>(key: K, value: IFormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setSuccess(false);
  }, []);

  const parseEmails = (str: string) =>
    str.split(',').map(s => s.trim()).filter(Boolean);

  const handleSave = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      const domains = form.allowedDomains.split('\n').map(s => s.trim()).filter(Boolean);

      await updateSettings({
        input: {
          placeOrderButtonSelector: form.placeOrderButtonSelector,
          companyFieldsStatus: form.companyFieldsStatus,
          orderCombinationRefundDistributionStatus: form.orderCombinationRefundDistributionStatus,
          orderNotifications: {
            merchantOrderConfirmation: {
              active: form.orderNotificationsActive,
              sendCopiesTo: parseEmails(form.orderNotificationsCopies),
            },
            orderConfirmation: {
              active: form.orderNotificationsActive,
              sendCopiesTo: parseEmails(form.orderNotificationsCopies),
            },
            orderShipped: {
              active: form.orderShippedActive,
              sendCopiesTo: parseEmails(form.orderShippedCopies),
            },
            orderCancelled: {
              active: form.orderCancelledActive,
              sendCopiesTo: parseEmails(form.orderCancelledCopies),
            },
          },
          successBehavior: form.successBehavior,
          successRedirectUrl: form.successRedirectUrl || undefined,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="title">Checkout Settings</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </Button>
      </div>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Checkout settings saved.</p>}

      {/* ===== General ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>General</p>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Place order button</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Enter the CSS selector for your &quot;Place order&quot; button. This will trigger Checkout.
              </p>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Input
              label="Enter a CSS selector #id or .class"
              value={form.placeOrderButtonSelector}
              onChange={e => update('placeOrderButtonSelector', e.target.value)}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Enable business address fields</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              Let customers add a company name and, for EU addresses, an EORI number.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.companyFieldsStatus === 'ENABLED'}
              onChange={checked => update('companyFieldsStatus', checked ? 'ENABLED' : 'DISABLED')}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={rowLabel}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Auto-distribute order combination refunds</p>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
              When enabled, delta refunds from order combinations are automatically distributed to customers.
              When disabled, the refund amount is saved for manual handling.
            </p>
          </div>
          <div style={rowControl}>
            <Switch
              checked={form.orderCombinationRefundDistributionStatus === 'ENABLED'}
              onChange={checked =>
                update('orderCombinationRefundDistributionStatus', checked ? 'ENABLED' : 'DISABLED')
              }
            />
          </div>
        </div>
      </div>

      {/* ===== Emails ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Emails</p>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Order notifications</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Add email addresses to get notified whenever a new international order is placed.
              </p>
            </div>
            <div style={rowControl}>
              <Switch
                checked={form.orderNotificationsActive === 'ENABLED'}
                onChange={checked => update('orderNotificationsActive', checked ? 'ENABLED' : 'DISABLED')}
              />
            </div>
          </div>
          {form.orderNotificationsActive === 'ENABLED' && (
            <div style={{ marginTop: 12 }}>
              <Input
                label="Send copies to (comma-separated emails)"
                value={form.orderNotificationsCopies}
                onChange={e => update('orderNotificationsCopies', e.target.value)}
                placeholder="team@example.com, admin@example.com"
              />
            </div>
          )}
        </div>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Order shipped</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Enter emails for order shipped notifications.
              </p>
            </div>
            <div style={rowControl}>
              <Switch
                checked={form.orderShippedActive === 'ENABLED'}
                onChange={checked => update('orderShippedActive', checked ? 'ENABLED' : 'DISABLED')}
              />
            </div>
          </div>
          {form.orderShippedActive === 'ENABLED' && (
            <div style={{ marginTop: 12 }}>
              <Input
                label="Send copies to (comma-separated emails)"
                value={form.orderShippedCopies}
                onChange={e => update('orderShippedCopies', e.target.value)}
                placeholder="shipping@example.com"
              />
            </div>
          )}
        </div>

        <div>
          <div style={rowStyle}>
            <div style={rowLabel}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Order cancellation</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Enter emails for order cancellation notifications.
              </p>
            </div>
            <div style={rowControl}>
              <Switch
                checked={form.orderCancelledActive === 'ENABLED'}
                onChange={checked => update('orderCancelledActive', checked ? 'ENABLED' : 'DISABLED')}
              />
            </div>
          </div>
          {form.orderCancelledActive === 'ENABLED' && (
            <div style={{ marginTop: 12 }}>
              <Input
                label="Send copies to (comma-separated emails)"
                value={form.orderCancelledCopies}
                onChange={e => update('orderCancelledCopies', e.target.value)}
                placeholder="support@example.com"
              />
            </div>
          )}
        </div>
      </div>

      {/* ===== URLs ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>URLs</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Allowed domains</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Enter a list of URLs where you plan to use Checkout, each separated by a newline.
            These domains will be shared between both the Checkout and Hello services.
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

      {/* ===== Integration ===== */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Integration</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Success page type</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Select a success page type.
          </p>
          <div style={{ marginTop: 12 }}>
            <Select
              label="Select a success behavior"
              value={SUCCESS_BEHAVIOR_OPTIONS.find(o => o.value === form.successBehavior) || null}
              onChange={o => { if (o) update('successBehavior', o.value); }}
              options={SUCCESS_BEHAVIOR_OPTIONS}
            />
          </div>
          {form.successBehavior === 'REDIRECT_TO_SUCCESS_PAGE' && (
            <div style={{ marginTop: 12 }}>
              <Input
                label="Enter success page URL"
                value={form.successRedirectUrl}
                onChange={e => update('successRedirectUrl', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

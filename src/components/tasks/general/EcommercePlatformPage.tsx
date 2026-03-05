'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  ONLINE_STORE_SETTINGS_QUERY,
  type IOnlineStoreSettingsData,
} from '@/graphql/queries/organization';
import { ONLINE_STORE_SETTINGS_UPDATE } from '@/graphql/mutations/organization';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

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

export const EcommercePlatformPage = () => {
  const [platform, setPlatform] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IOnlineStoreSettingsData>({
    query: ONLINE_STORE_SETTINGS_QUERY,
    schema: 'internal',
  });

  const { execute: updateSettings } = useGraphQLMutation({
    query: ONLINE_STORE_SETTINGS_UPDATE,
    schema: 'internal',
  });

  const settings = data?.onlineStoreSettings;

  useEffect(() => {
    if (settings?.platform) {
      setPlatform(settings.platform);
    }
  }, [settings?.platform]);

  const handleSubmit = async () => {
    if (!platform) {
      setSubmitError('Please select a platform.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      await updateSettings({
        input: { platform },
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

  const hasChanges = platform !== (settings?.platform || '');

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">E-commerce Platform</Text>

      <div
        style={{
          padding: 24,
          background: 'white',
          borderRadius: 8,
          border: '1px solid var(--amino-gray-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 500,
        }}
      >
        <Text type="subtitle">Platform</Text>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
          The e-commerce platform this merchant uses for their online store.
        </p>

        <Select
          label="E-commerce Platform"
          value={PLATFORM_OPTIONS.find(o => o.value === platform) || null}
          onChange={option => {
            if (option) {
              setPlatform(option.value);
              setSuccess(false);
            }
          }}
          options={PLATFORM_OPTIONS}
        />

        {submitError && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
            {submitError}
          </p>
        )}

        {success && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>
            Platform updated successfully.
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

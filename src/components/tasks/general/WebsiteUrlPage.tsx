'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
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

export const WebsiteUrlPage = () => {
  const [url, setUrl] = useState('');
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
    if (settings?.url) {
      setUrl(settings.url);
    }
  }, [settings?.url]);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setSubmitError('Website URL is required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      await updateSettings({
        input: { url: url.trim() },
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

  const hasChanges = url.trim() !== (settings?.url || '');

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Website URL</Text>

      <div
        style={{
          padding: 24,
          background: 'white',
          border: '1px solid var(--amino-gray-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxWidth: 500,
        }}
      >
        <Text type="subtitle">Store URL</Text>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
          The primary website URL for this merchant&apos;s online store.
        </p>

        <Input
          label="Website URL"
          type="url"
          value={url}
          onChange={e => {
            setUrl(e.target.value);
            setSuccess(false);
          }}
          placeholder="https://example.com"
        />

        {submitError && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
            {submitError}
          </p>
        )}

        {success && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>
            Website URL updated successfully.
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

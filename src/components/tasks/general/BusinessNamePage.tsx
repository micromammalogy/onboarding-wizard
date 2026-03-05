'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  ORGANIZATION_QUERY,
  type IOrganizationData,
} from '@/graphql/queries/organization';
import { ORGANIZATION_UPDATE } from '@/graphql/mutations/organization';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

export const BusinessNamePage = () => {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IOrganizationData>({
    query: ORGANIZATION_QUERY,
    schema: 'internal',
  });

  const { execute: updateOrg } = useGraphQLMutation({
    query: ORGANIZATION_UPDATE,
    schema: 'internal',
  });

  const org = data?.organization;

  useEffect(() => {
    if (org?.name) {
      setName(org.name);
    }
  }, [org?.name]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setSubmitError('Business name is required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      await updateOrg({
        input: { id: org?.id, name: name.trim() },
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

  const hasChanges = name.trim() !== (org?.name || '');

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Business Name</Text>

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
        <Text type="subtitle">Organization Name</Text>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
          This is the business name displayed across Zonos for this merchant.
        </p>

        <Input
          label="Business Name"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setSuccess(false);
          }}
        />

        {submitError && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
            {submitError}
          </p>
        )}

        {success && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>
            Business name updated successfully.
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

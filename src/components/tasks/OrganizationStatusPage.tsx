'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
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

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'CHURNED', label: 'Churned' },
  { value: 'DELETED', label: 'Deleted' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'ONBOARDING', label: 'Onboarding' },
  { value: 'TRIAL', label: 'Staging' },
  { value: 'TRANSACTING', label: 'Transacting' },
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

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  ACTIVE: { bg: 'var(--amino-green-50)', border: 'var(--amino-green-300)', text: 'var(--amino-green-700)' },
  TRANSACTING: { bg: 'var(--amino-blue-50)', border: 'var(--amino-blue-300)', text: 'var(--amino-blue-700)' },
  ONBOARDING: { bg: 'var(--amino-orange-50)', border: 'var(--amino-orange-300)', text: 'var(--amino-orange-700)' },
  TRIAL: { bg: 'var(--amino-purple-50)', border: 'var(--amino-purple-300)', text: 'var(--amino-purple-700)' },
  LEAD: { bg: 'var(--amino-gray-50)', border: 'var(--amino-gray-300)', text: 'var(--amino-gray-700)' },
  CHURNED: { bg: 'var(--amino-red-50)', border: 'var(--amino-red-300)', text: 'var(--amino-red-700)' },
  ARCHIVED: { bg: 'var(--amino-gray-100)', border: 'var(--amino-gray-400)', text: 'var(--amino-gray-600)' },
  DELETED: { bg: 'var(--amino-red-100)', border: 'var(--amino-red-400)', text: 'var(--amino-red-800)' },
};

export const OrganizationStatusPage = () => {
  const [status, setStatus] = useState<string>('');
  const [orgType, setOrgType] = useState<string>('');
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
    if (org) {
      setStatus(org.status || '');
      setOrgType(org.type || '');
    }
  }, [org]);

  const handleSave = async () => {
    if (!org) return;
    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      await updateOrg({
        input: {
          id: org.id,
          status,
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

  const currentLabel = STATUS_OPTIONS.find(o => o.value === org?.status)?.label || org?.status || 'Unknown';
  const colors = STATUS_COLORS[org?.status || ''] || STATUS_COLORS.LEAD;
  const isDirty = status !== (org?.status || '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="title">Organization Status</Text>
        <Button variant="primary" onClick={handleSave} loading={submitting} disabled={!isDirty}>
          Save
        </Button>
      </div>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}
      {success && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Organization status updated.</p>}

      {/* Warning banner */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--amino-orange-50)',
          border: '1px solid var(--amino-orange-200)',
          borderRadius: 8,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}
      >
        <span style={{ fontSize: 16 }}>!</span>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--amino-orange-800)' }}>
            Admin setting
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--amino-orange-700)' }}>
            Changing organization status can affect account access and billing. Use caution.
          </p>
        </div>
      </div>

      {/* Current status badge */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Current Status</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              padding: '6px 16px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              color: colors.text,
            }}
          >
            {currentLabel}
          </div>
          {orgType && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: 'var(--amino-gray-400)', fontWeight: 500 }}>Organization type</span>
              <span style={{ fontSize: 14, color: 'var(--amino-gray-700)' }}>{orgType}</span>
            </div>
          )}
        </div>
      </div>

      {/* Update status */}
      <div style={sectionCard}>
        <p style={sectionTitle}>Organization</p>

        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Organization status</p>
          <p style={{ margin: '2px 0 0 0', fontSize: 13, color: 'var(--amino-gray-500)' }}>
            Select the current status of this organization.
          </p>
          <div style={{ marginTop: 12 }}>
            <Select
              label="Organization status"
              value={STATUS_OPTIONS.find(o => o.value === status) || null}
              onChange={o => {
                if (o) {
                  setStatus(o.value);
                  setSuccess(false);
                }
              }}
              options={STATUS_OPTIONS}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

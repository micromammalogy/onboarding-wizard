'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import { TAX_IDS_QUERY, type ITaxIdsData } from '@/graphql/queries/taxIds';
import { TAX_ID_CREATE, TAX_ID_DELETE } from '@/graphql/mutations/taxIds';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const TAX_ID_TYPE_OPTIONS = [
  { value: 'EORI', label: 'EORI' },
  { value: 'IOSS', label: 'IOSS' },
  { value: 'SSN', label: 'SSN (Norway)' },
  { value: 'VOEC', label: 'VOEC (Norway)' },
  { value: 'GST', label: 'GST (Australia/NZ/Singapore/India)' },
  { value: 'VAT', label: 'VAT' },
  { value: 'LVG', label: 'LVG (UK)' },
  { value: 'HMRC', label: 'HMRC (UK)' },
  { value: 'IRD', label: 'IRD (New Zealand)' },
  { value: 'RUT', label: 'RUT (Chile)' },
];

const COUNTRY_OPTIONS = [
  { value: 'AU', label: 'Australia' },
  { value: 'CL', label: 'Chile' },
  { value: 'EU', label: 'European Union' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IN', label: 'India' },
  { value: 'NO', label: 'Norway' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'SG', label: 'Singapore' },
  { value: 'US', label: 'United States' },
];

const sectionCard: React.CSSProperties = {
  padding: 24,
  background: 'white',
  borderRadius: 8,
  border: '1px solid var(--amino-gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

export const TaxIdsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [newTaxId, setNewTaxId] = useState('');
  const [newType, setNewType] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data, error, isLoading, mutate } = useGraphQL<ITaxIdsData>({
    query: TAX_IDS_QUERY,
    schema: 'internal',
  });

  const { execute: createTaxId } = useGraphQLMutation({
    query: TAX_ID_CREATE,
    schema: 'internal',
  });

  const { execute: deleteTaxId } = useGraphQLMutation({
    query: TAX_ID_DELETE,
    schema: 'internal',
  });

  const taxIds = data?.taxIds || [];

  const handleCreate = async () => {
    if (!newTaxId.trim() || !newType || !newCountry) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      await createTaxId({
        input: {
          taxIdNumber: newTaxId.trim(),
          type: newType,
          countryCode: newCountry,
        },
      });

      mutate();
      setNewTaxId('');
      setNewType('');
      setNewCountry('');
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTaxId({ id });
      mutate();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="title">Tax IDs</Text>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Tax ID'}
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-500)' }}>
        Manage your tax identification numbers for international trade compliance. Tax IDs are required for
        importing goods into certain countries.
      </p>

      {submitError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>}

      {showForm && (
        <div style={sectionCard}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Add new Tax ID</p>

          <Select
            label="Country"
            value={COUNTRY_OPTIONS.find(o => o.value === newCountry) || null}
            onChange={o => setNewCountry(o?.value || '')}
            options={COUNTRY_OPTIONS}
          />

          <Select
            label="Tax ID type"
            value={TAX_ID_TYPE_OPTIONS.find(o => o.value === newType) || null}
            onChange={o => setNewType(o?.value || '')}
            options={TAX_ID_TYPE_OPTIONS}
          />

          <Input
            label="Tax ID number"
            value={newTaxId}
            onChange={e => setNewTaxId(e.target.value)}
            placeholder="Enter your tax ID number"
          />

          <Button variant="primary" onClick={handleCreate} loading={submitting}>
            Save Tax ID
          </Button>
        </div>
      )}

      {taxIds.length === 0 && !showForm ? (
        <div style={{ ...sectionCard, alignItems: 'center', padding: 48 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-400)' }}>
            No tax IDs configured. Click &quot;Add Tax ID&quot; to get started.
          </p>
        </div>
      ) : (
        taxIds.map(taxId => (
          <div key={taxId.id} style={sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: 'var(--amino-gray-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--amino-gray-600)',
                  }}
                >
                  {taxId.countryCode}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                    {taxId.type}
                  </p>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
                    {taxId.taxIdNumber || 'No Tax ID'}
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(taxId.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

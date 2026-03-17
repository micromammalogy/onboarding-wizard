'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  ORGANIZATION_QUERY,
  type IOrganizationData,
} from '@/graphql/queries/organization';
import {
  ORGANIZATION_UPDATE,
  PARTY_CREATE_FOR_ORG,
} from '@/graphql/mutations/organization';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

type IAddressForm = {
  phone: string;
  line1: string;
  line2: string;
  locality: string;
  administrativeAreaCode: string;
  postalCode: string;
  countryCode: string;
};

const EMPTY_ADDRESS: IAddressForm = {
  phone: '',
  line1: '',
  line2: '',
  locality: '',
  administrativeAreaCode: '',
  postalCode: '',
  countryCode: 'US',
};

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'CN', label: 'China' },
  { value: 'MX', label: 'Mexico' },
  { value: 'JP', label: 'Japan' },
  { value: 'NL', label: 'Netherlands' },
];

export const BusinessAddressPage = () => {
  const [form, setForm] = useState<IAddressForm>(EMPTY_ADDRESS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data, error, isLoading, mutate } = useGraphQL<IOrganizationData>({
    query: ORGANIZATION_QUERY,
    schema: 'internal',
  });

  const { execute: createParty } = useGraphQLMutation<{ partyCreate: { id: string } }>({
    query: PARTY_CREATE_FOR_ORG,
    schema: 'internal',
  });

  const { execute: updateOrg } = useGraphQLMutation({
    query: ORGANIZATION_UPDATE,
    schema: 'internal',
  });

  const org = data?.organization;
  const location = org?.party?.location;
  const person = org?.party?.person;

  useEffect(() => {
    if (location || person) {
      setForm({
        phone: person?.phone || '',
        line1: location?.line1 || '',
        line2: location?.line2 || '',
        locality: location?.locality || '',
        administrativeAreaCode: location?.administrativeAreaCode || '',
        postalCode: location?.postalCode || '',
        countryCode: location?.countryCode || 'US',
      });
    }
  }, [location, person]);

  const handleSubmit = async () => {
    if (!form.line1.trim() || !form.locality.trim() || !form.countryCode) {
      setSubmitError('Address line 1, city, and country are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      // Step 1: Create party with address
      const partyResult = await createParty({
        input: {
          type: 'ORIGIN',
          location: {
            line1: form.line1.trim(),
            line2: form.line2.trim() || undefined,
            locality: form.locality.trim(),
            administrativeAreaCode: form.administrativeAreaCode.trim() || undefined,
            postalCode: form.postalCode.trim(),
            countryCode: form.countryCode,
          },
          person: {
            phone: form.phone.trim() || undefined,
            companyName: org?.name || undefined,
          },
        },
      });

      const partyId = partyResult?.partyCreate?.id;
      if (!partyId) {
        throw new Error('Failed to create address — no party ID returned');
      }

      // Step 2: Link party to organization
      await updateOrg({
        input: { id: org?.id, partyId },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Text type="title">Business Address</Text>

      <div
        style={{
          padding: 24,
          background: 'white',
          border: '1px solid var(--amino-gray-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <Text type="subtitle">Address</Text>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
          The physical business address for this merchant. Used for shipping origin and compliance.
        </p>

        <Input
          label="Phone"
          value={form.phone}
          onChange={e => {
            setForm(f => ({ ...f, phone: e.target.value }));
            setSuccess(false);
          }}
        />

        <Input
          label="Address Line 1"
          value={form.line1}
          onChange={e => {
            setForm(f => ({ ...f, line1: e.target.value }));
            setSuccess(false);
          }}
        />

        <Input
          label="Address Line 2"
          value={form.line2}
          onChange={e => {
            setForm(f => ({ ...f, line2: e.target.value }));
            setSuccess(false);
          }}
          placeholder="Optional"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Input
            label="City"
            value={form.locality}
            onChange={e => {
              setForm(f => ({ ...f, locality: e.target.value }));
              setSuccess(false);
            }}
          />
          <Input
            label="State / Province"
            value={form.administrativeAreaCode}
            onChange={e => {
              setForm(f => ({ ...f, administrativeAreaCode: e.target.value }));
              setSuccess(false);
            }}
          />
          <Input
            label="Postal Code"
            value={form.postalCode}
            onChange={e => {
              setForm(f => ({ ...f, postalCode: e.target.value }));
              setSuccess(false);
            }}
          />
        </div>

        <div style={{ maxWidth: 300 }}>
          <Select
            label="Country"
            value={COUNTRY_OPTIONS.find(o => o.value === form.countryCode) || null}
            onChange={option => {
              if (option) {
                setForm(f => ({ ...f, countryCode: option.value }));
                setSuccess(false);
              }
            }}
            options={COUNTRY_OPTIONS}
          />
        </div>

        {submitError && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
            {submitError}
          </p>
        )}

        {success && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>
            Business address updated successfully.
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

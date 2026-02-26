'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  FULFILLMENT_CENTERS_QUERY,
  type IFulfillmentCentersData,
} from '@/graphql/queries/fulfillmentCenters';
import {
  PARTY_CREATE,
  FULFILLMENT_CENTER_CREATE,
  FULFILLMENT_CENTER_UPDATE,
  FULFILLMENT_CENTER_DELETE,
} from '@/graphql/mutations/fulfillmentCenters';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import type { IFulfillmentCenter, IFulfillmentCenterType } from '@/types/tasks';

type IFormState = {
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  line3: string;
  locality: string;
  administrativeAreaCode: string;
  postalCode: string;
  countryCode: string;
  type: IFulfillmentCenterType;
};

const EMPTY_FORM: IFormState = {
  companyName: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  line1: '',
  line2: '',
  line3: '',
  locality: '',
  administrativeAreaCode: '',
  postalCode: '',
  countryCode: 'US',
  type: 'STANDARD',
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
];

const TYPE_OPTIONS = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'STANDARD', label: 'Standard' },
  { value: 'CONSOLIDATION_CENTER', label: 'Consolidation Center' },
];

export const FulfillmentLocationPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [editingCenter, setEditingCenter] = useState<IFulfillmentCenter | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data, error, isLoading, mutate } = useGraphQL<IFulfillmentCentersData>({
    query: FULFILLMENT_CENTERS_QUERY,
    schema: 'internal',
  });

  const { execute: createParty } = useGraphQLMutation<{ partyCreate: { id: string } }>({
    query: PARTY_CREATE,
    schema: 'internal',
  });

  const { execute: createCenter } = useGraphQLMutation({
    query: FULFILLMENT_CENTER_CREATE,
    schema: 'internal',
  });

  const { execute: updateCenter } = useGraphQLMutation({
    query: FULFILLMENT_CENTER_UPDATE,
    schema: 'internal',
  });

  const { execute: deleteCenter, isLoading: deleting } = useGraphQLMutation({
    query: FULFILLMENT_CENTER_DELETE,
    schema: 'internal',
  });

  const centers: IFulfillmentCenter[] = data?.fulfillmentCenters || [];

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingCenter(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleEdit = (center: IFulfillmentCenter) => {
    const loc = center.party.location;
    const person = center.party.person;
    setForm({
      companyName: person?.companyName || '',
      firstName: person?.firstName || '',
      lastName: person?.lastName || '',
      email: person?.email || '',
      phone: person?.phone || '',
      line1: loc?.line1 || '',
      line2: loc?.line2 || '',
      line3: loc?.line3 || '',
      locality: loc?.locality || '',
      administrativeAreaCode: loc?.administrativeAreaCode || '',
      postalCode: loc?.postalCode || '',
      countryCode: loc?.countryCode || 'US',
      type: center.type,
    });
    setEditingCenter(center);
    setShowForm(true);
    setSubmitError('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      // Step 1: Create a party with location + person
      const partyResult = await createParty({
        input: {
          type: 'ORIGIN',
          location: {
            line1: form.line1,
            line2: form.line2 || undefined,
            line3: form.line3 || undefined,
            locality: form.locality,
            administrativeAreaCode: form.administrativeAreaCode || undefined,
            countryCode: form.countryCode,
            postalCode: form.postalCode,
          },
          person: {
            companyName: form.companyName || undefined,
            firstName: form.firstName || undefined,
            lastName: form.lastName || undefined,
            email: form.email || undefined,
            phone: form.phone || undefined,
          },
        },
      });

      const partyId = partyResult?.partyCreate?.id;
      if (!partyId) {
        throw new Error('Failed to create party — no ID returned');
      }

      // Step 2: Create or update fulfillment center
      const name = form.companyName
        || [form.firstName, form.lastName].filter(Boolean).join(' ')
        || 'Fulfillment center';

      if (editingCenter) {
        await updateCenter({
          input: {
            id: editingCenter.id,
            name,
            party: partyId,
            type: form.type,
          },
        });
      } else {
        // First center should be PRIMARY
        const type = centers.length === 0 ? 'PRIMARY' : form.type;
        await createCenter({
          partyId,
          name,
          type,
        });
      }

      mutate();
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fulfillment center?')) return;
    try {
      await deleteCenter({ deleteId: id });
      mutate();
    } catch {
      // error captured in hook
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="title">Fulfillment Locations</Text>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Location
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            padding: 24,
            background: 'white',
            borderRadius: 8,
            border: '1px solid var(--amino-gray-200)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <Text type="subtitle">
            {editingCenter ? 'Edit Location' : 'Add Location'}
          </Text>

          {/* Contact info */}
          <Text type="bold-label">Contact</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Company Name"
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input
              label="First Name"
              value={form.firstName}
              onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>

          {/* Address */}
          <Text type="bold-label">Address</Text>
          <Input
            label="Address Line 1"
            value={form.line1}
            onChange={e => setForm(f => ({ ...f, line1: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input
              label="Address Line 2"
              value={form.line2}
              onChange={e => setForm(f => ({ ...f, line2: e.target.value }))}
            />
            <Input
              label="Address Line 3"
              value={form.line3}
              onChange={e => setForm(f => ({ ...f, line3: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input
              label="City"
              value={form.locality}
              onChange={e => setForm(f => ({ ...f, locality: e.target.value }))}
            />
            <Input
              label="State / Province"
              value={form.administrativeAreaCode}
              onChange={e => setForm(f => ({ ...f, administrativeAreaCode: e.target.value }))}
            />
            <Input
              label="Postal Code"
              value={form.postalCode}
              onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Select
              label="Country"
              value={COUNTRY_OPTIONS.find(o => o.value === form.countryCode) || null}
              onChange={option => {
                if (option) setForm(f => ({ ...f, countryCode: option.value }));
              }}
              options={COUNTRY_OPTIONS}
            />
            <Select
              label="Type"
              value={TYPE_OPTIONS.find(o => o.value === form.type) || null}
              onChange={option => {
                if (option) setForm(f => ({ ...f, type: option.value as IFulfillmentCenterType }));
              }}
              options={TYPE_OPTIONS}
            />
          </div>

          {submitError && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
              {submitError}
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="subtle" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
            >
              {editingCenter ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {centers.length > 0 ? (
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            border: '1px solid var(--amino-gray-200)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--amino-gray-200)' }}>
                {['Name', 'Address', 'City', 'Country', 'Type', 'Actions'].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: 'left',
                      padding: '10px 16px',
                      fontSize: 12,
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      color: 'var(--amino-gray-500)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {centers.map(center => {
                const loc = center.party.location;
                const displayName = center.name || center.party.person?.companyName || 'Unnamed';
                return (
                  <tr
                    key={center.id}
                    style={{ borderBottom: '1px solid var(--amino-gray-100)' }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <div style={{ fontWeight: 500 }}>{displayName}</div>
                      {center.party.person?.email && (
                        <div style={{ fontSize: 12, color: 'var(--amino-gray-400)' }}>
                          {center.party.person.email}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {loc?.line1 || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {[loc?.locality, loc?.administrativeAreaCode].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {loc?.countryCode || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 500,
                          background: center.type === 'PRIMARY'
                            ? 'var(--amino-blue-50)'
                            : 'var(--amino-gray-100)',
                          color: center.type === 'PRIMARY'
                            ? 'var(--amino-blue-700)'
                            : 'var(--amino-gray-600)',
                        }}
                      >
                        {center.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" variant="subtle" onClick={() => handleEdit(center)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(center.id)}
                          loading={deleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            background: 'white',
            borderRadius: 8,
            border: '1px solid var(--amino-gray-200)',
          }}
        >
          <Text type="subtitle" color="gray500">
            No fulfillment locations found
          </Text>
          <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
            Add a fulfillment location to get started with shipping configuration.
          </p>
        </div>
      )}
    </div>
  );
};

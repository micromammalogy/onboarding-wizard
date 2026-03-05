'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  PACKAGING_OPTIONS_QUERY,
  type IPackagingOptionsData,
  type IPackagingOption,
  type IDimensionalUnitCode,
  type IWeightUnitCode,
  type IPackagingType,
} from '@/graphql/queries/packagingOptions';
import {
  PACKAGING_OPTION_CREATE,
  PACKAGING_OPTION_DELETE,
} from '@/graphql/mutations/packagingOptions';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

type IFormState = {
  name: string;
  length: string;
  width: string;
  height: string;
  dimensionalUnit: IDimensionalUnitCode;
  packageWeight: string;
  weightCapacity: string;
  weightUnit: IWeightUnitCode;
  type: IPackagingType;
};

const EMPTY_FORM: IFormState = {
  name: '',
  length: '',
  width: '',
  height: '',
  dimensionalUnit: 'INCH',
  packageWeight: '',
  weightCapacity: '',
  weightUnit: 'POUND',
  type: 'PACKAGE',
};

const DIMENSIONAL_UNIT_OPTIONS = [
  { value: 'INCH', label: 'Inches (in)' },
  { value: 'CENTIMETER', label: 'Centimeters (cm)' },
  { value: 'METER', label: 'Meters (m)' },
  { value: 'MILLIMETER', label: 'Millimeters (mm)' },
  { value: 'FOOT', label: 'Feet (ft)' },
];

const WEIGHT_UNIT_OPTIONS = [
  { value: 'POUND', label: 'Pounds (lb)' },
  { value: 'OUNCE', label: 'Ounces (oz)' },
  { value: 'KILOGRAM', label: 'Kilograms (kg)' },
  { value: 'GRAM', label: 'Grams (g)' },
];

const TYPE_OPTIONS: { value: IPackagingType; label: string }[] = [
  { value: 'PACKAGE', label: 'Package' },
  { value: 'ENVELOPE', label: 'Envelope' },
  { value: 'FLAT', label: 'Flat' },
  { value: 'PAK', label: 'Pak' },
  { value: 'PARCEL', label: 'Parcel' },
  { value: 'POLYBAG', label: 'Polybag' },
  { value: 'TUBE', label: 'Tube' },
];

const DIMENSION_ABBREV: Record<IDimensionalUnitCode, string> = {
  INCH: 'in',
  CENTIMETER: 'cm',
  METER: 'm',
  MILLIMETER: 'mm',
  FOOT: 'ft',
};

const WEIGHT_ABBREV: Record<IWeightUnitCode, string> = {
  POUND: 'lb',
  OUNCE: 'oz',
  KILOGRAM: 'kg',
  GRAM: 'g',
};

export const CartonizationPage = () => {
  const [form, setForm] = useState<IFormState>(EMPTY_FORM);
  const [editingOption, setEditingOption] = useState<IPackagingOption | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data, error, isLoading, mutate } = useGraphQL<IPackagingOptionsData>({
    query: PACKAGING_OPTIONS_QUERY,
    schema: 'internal',
  });

  const { execute: createOption } = useGraphQLMutation({
    query: PACKAGING_OPTION_CREATE,
    schema: 'internal',
  });

  const { execute: deleteOption, isLoading: deleting } = useGraphQLMutation({
    query: PACKAGING_OPTION_DELETE,
    schema: 'internal',
  });

  const options: IPackagingOption[] = data?.packagingOptions || [];

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingOption(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleEdit = (option: IPackagingOption) => {
    setForm({
      name: option.name || '',
      length: option.length,
      width: option.width,
      height: option.height,
      dimensionalUnit: option.dimensionalUnit,
      packageWeight: option.packageWeight,
      weightCapacity: option.weightCapacity,
      weightUnit: option.weightUnit,
      type: option.type,
    });
    setEditingOption(option);
    setShowForm(true);
    setSubmitError('');
  };

  const handleSubmit = async () => {
    if (!form.length || !form.width || !form.height || !form.weightCapacity) {
      setSubmitError('Length, width, height, and max weight are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      // Edit = delete old + create new (no update mutation exists)
      if (editingOption) {
        await deleteOption({ input: editingOption.id });
      }

      await createOption({
        input: [
          {
            name: form.name || undefined,
            length: parseFloat(form.length),
            width: parseFloat(form.width),
            height: parseFloat(form.height),
            dimensionalUnit: form.dimensionalUnit,
            packageWeight: form.packageWeight ? parseFloat(form.packageWeight) : undefined,
            weightCapacity: parseFloat(form.weightCapacity),
            weightUnit: form.weightUnit,
            type: form.type,
          },
        ],
      });

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
    if (!confirm('Delete this box configuration?')) return;
    try {
      await deleteOption({ input: id });
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
        <Text type="title">Cartonization</Text>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Box
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
            {editingOption ? 'Edit Box' : 'Add Box'}
          </Text>

          <Input
            label="Box Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Small box, Large flat rate"
          />

          <Text type="bold-label">Dimensions</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <Input
              label="Length"
              type="number"
              value={form.length}
              onChange={e => setForm(f => ({ ...f, length: e.target.value }))}
            />
            <Input
              label="Width"
              type="number"
              value={form.width}
              onChange={e => setForm(f => ({ ...f, width: e.target.value }))}
            />
            <Input
              label="Height"
              type="number"
              value={form.height}
              onChange={e => setForm(f => ({ ...f, height: e.target.value }))}
            />
            <Select
              label="Unit"
              value={DIMENSIONAL_UNIT_OPTIONS.find(o => o.value === form.dimensionalUnit) || null}
              onChange={option => {
                if (option) setForm(f => ({ ...f, dimensionalUnit: option.value as IDimensionalUnitCode }));
              }}
              options={DIMENSIONAL_UNIT_OPTIONS}
            />
          </div>

          <Text type="bold-label">Weight</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input
              label="Package Weight (empty box)"
              type="number"
              value={form.packageWeight}
              onChange={e => setForm(f => ({ ...f, packageWeight: e.target.value }))}
              placeholder="Optional"
            />
            <Input
              label="Max Weight (capacity)"
              type="number"
              value={form.weightCapacity}
              onChange={e => setForm(f => ({ ...f, weightCapacity: e.target.value }))}
            />
            <Select
              label="Unit"
              value={WEIGHT_UNIT_OPTIONS.find(o => o.value === form.weightUnit) || null}
              onChange={option => {
                if (option) setForm(f => ({ ...f, weightUnit: option.value as IWeightUnitCode }));
              }}
              options={WEIGHT_UNIT_OPTIONS}
            />
          </div>

          <Text type="bold-label">Package Type</Text>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, maxWidth: 300 }}>
            <Select
              label="Type"
              value={TYPE_OPTIONS.find(o => o.value === form.type) || null}
              onChange={option => {
                if (option) setForm(f => ({ ...f, type: option.value as IPackagingType }));
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
              {editingOption ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {options.length > 0 ? (
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
                {['Name', 'Dimensions (L x W x H)', 'Weight Capacity', 'Package Weight', 'Type', 'Actions'].map(h => (
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
              {options.map(option => {
                const dimUnit = DIMENSION_ABBREV[option.dimensionalUnit] || option.dimensionalUnit;
                const wtUnit = WEIGHT_ABBREV[option.weightUnit] || option.weightUnit;
                return (
                  <tr
                    key={option.id}
                    style={{ borderBottom: '1px solid var(--amino-gray-100)' }}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>
                      {option.name || 'Unnamed'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {option.length} x {option.width} x {option.height} {dimUnit}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {option.weightCapacity} {wtUnit}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      {option.packageWeight ? `${option.packageWeight} ${wtUnit}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 500,
                          background: 'var(--amino-gray-100)',
                          color: 'var(--amino-gray-600)',
                        }}
                      >
                        {option.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button size="sm" variant="subtle" onClick={() => handleEdit(option)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(option.id)}
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
            No box configurations found
          </Text>
          <p style={{ fontSize: 14, color: 'var(--amino-gray-400)', marginTop: 8 }}>
            Add a box to define the packaging options used for cartonization.
          </p>
        </div>
      )}
    </div>
  );
};

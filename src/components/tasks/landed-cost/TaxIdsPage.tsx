'use client';

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { Dialog } from '@zonos/amino/components/dialog/Dialog';
import { RichCardStateSelect } from '@zonos/amino/components/rich-card-select/RichCardStateSelect';
import { getUnitedStates } from '@zonos/amino/utils/unitedStates';
import type { UnitedState } from '@zonos/amino/types/UnitedStates';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import { TAX_IDS_QUERY, type ITaxIdsData, type ITaxId } from '@/graphql/queries/taxIds';
import { TAX_ID_CREATE, TAX_ID_DELETE, TAX_ID_UPDATE } from '@/graphql/mutations/taxIds';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const GLOBAL_COUNTRIES = [
  { code: 'AU', label: 'Australia', taxLabel: 'ATO number (GST)', type: 'GST', info: 'Collecting 10% GST on orders under AU$1,000' },
  { code: 'CL', label: 'Chile', taxLabel: 'RUT number (VAT)', type: 'GST', info: 'Collecting 19% VAT on applicable orders' },
  { code: 'EU', label: 'European Union', taxLabel: 'IOSS VAT number', type: 'IOSS', info: 'Collecting VAT on orders under €150' },
  { code: 'GB', label: 'United Kingdom', taxLabel: 'HMRC VAT number', type: 'HMRC', info: 'Collecting 20% VAT on orders under £135' },
  { code: 'NZ', label: 'New Zealand', taxLabel: 'IRD number (GST)', type: 'GST', info: 'Collecting 15% GST on orders under NZ$1,000' },
  { code: 'NO', label: 'Norway', taxLabel: 'VOEC number', type: 'VOEC', info: 'Collecting 25% VAT on applicable orders' },
  { code: 'SG', label: 'Singapore', taxLabel: 'GST number', type: 'GST', info: 'Collecting 9% GST on orders under SGD$400' },
] as const;

const sectionCard: React.CSSProperties = {
  padding: 24,
  background: 'white',
  borderRadius: 8,
  border: '1px solid var(--amino-gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  margin: 0,
  color: 'var(--amino-gray-900)',
};

export const TaxIdsPage = () => {
  // Global tax ID form state
  const [showGlobalForm, setShowGlobalForm] = useState(false);
  const [globalCountry, setGlobalCountry] = useState('');
  const [globalTaxIdNumber, setGlobalTaxIdNumber] = useState('');

  // US state dialog state
  const [selectedState, setSelectedState] = useState<UnitedState | null>(null);
  const [stateTaxIdInput, setStateTaxIdInput] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Fetch all tax IDs
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

  const { execute: updateTaxId } = useGraphQLMutation({
    query: TAX_ID_UPDATE,
    schema: 'internal',
  });

  const allTaxIds = data?.taxIds || [];

  // Split into global vs US
  const globalTaxIds = useMemo(
    () => allTaxIds.filter(t => t.countryCode !== 'US'),
    [allTaxIds],
  );
  const usTaxIds = useMemo(
    () => allTaxIds.filter(t => t.countryCode === 'US'),
    [allTaxIds],
  );

  // Map of state code -> tax ID for quick lookup
  const stateTaxIdMap = useMemo(() => {
    const map: Record<string, ITaxId> = {};
    for (const t of usTaxIds) {
      if (t.administrativeAreaCode) {
        map[t.administrativeAreaCode] = t;
      }
    }
    return map;
  }, [usTaxIds]);

  // Build states list with highlight for those that have tax IDs
  const states = useMemo(() => {
    const base = getUnitedStates('EN');
    return base.map(s => ({
      ...s,
      highlighted: !!stateTaxIdMap[s.code],
    }));
  }, [stateTaxIdMap]);

  // Available countries for the global add dropdown (exclude already-added)
  const availableGlobalCountries = useMemo(() => {
    const existing = new Set(globalTaxIds.map(t => t.countryCode));
    return GLOBAL_COUNTRIES.filter(c => !existing.has(c.code)).map(c => ({
      value: c.code,
      label: c.label,
    }));
  }, [globalTaxIds]);

  // --- Global handlers ---
  const handleGlobalCreate = async () => {
    const country = GLOBAL_COUNTRIES.find(c => c.code === globalCountry);
    if (!globalTaxIdNumber.trim() || !country) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await createTaxId({
        input: {
          taxIdNumber: globalTaxIdNumber.trim(),
          type: country.type,
          countryCode: country.code,
        },
      });
      mutate();
      setGlobalTaxIdNumber('');
      setGlobalCountry('');
      setShowGlobalForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGlobalDelete = async (id: string) => {
    try {
      await deleteTaxId({ id });
      mutate();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  // --- US state handlers ---
  const handleStateClick = useCallback(
    (state: UnitedState) => {
      setSelectedState(state);
      const existing = stateTaxIdMap[state.code];
      setStateTaxIdInput(existing?.taxIdNumber || '');
    },
    [stateTaxIdMap],
  );

  const handleStateSave = async () => {
    if (!selectedState || !stateTaxIdInput.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const existing = stateTaxIdMap[selectedState.code];
      if (existing) {
        await updateTaxId({
          input: {
            id: existing.id,
            taxIdNumber: stateTaxIdInput.trim(),
          },
        });
      } else {
        await createTaxId({
          input: {
            taxIdNumber: stateTaxIdInput.trim(),
            type: 'STA',
            countryCode: 'US',
            administrativeAreaCodes: [selectedState.code],
            method: 'DOMESTIC',
          },
        });
      }
      mutate();
      setSelectedState(null);
      setStateTaxIdInput('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStateDelete = async () => {
    if (!selectedState) return;
    const existing = stateTaxIdMap[selectedState.code];
    if (!existing) return;
    setSubmitting(true);
    try {
      await deleteTaxId({ id: existing.id });
      mutate();
      setSelectedState(null);
      setStateTaxIdInput('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  const selectedStateTaxId = selectedState
    ? stateTaxIdMap[selectedState.code]
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 936 }}>
      <Text type="title">Tax IDs</Text>

      <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-500)' }}>
        Manage your tax identification numbers for international trade compliance.
        Tax IDs are required for importing goods into certain countries.
      </p>

      {submitError && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
          {submitError}
        </p>
      )}

      {/* ===== Global Tax IDs ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={sectionTitle}>Global Tax IDs</p>
          {availableGlobalCountries.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowGlobalForm(!showGlobalForm)}
            >
              {showGlobalForm ? 'Cancel' : 'Add tax ID'}
            </Button>
          )}
        </div>

        {showGlobalForm && (
          <div style={sectionCard}>
            <Select
              label="Country"
              value={availableGlobalCountries.find(o => o.value === globalCountry) || null}
              onChange={o => setGlobalCountry(o?.value || '')}
              options={availableGlobalCountries}
            />
            {globalCountry && (
              <>
                <Input
                  label={GLOBAL_COUNTRIES.find(c => c.code === globalCountry)?.taxLabel || 'Tax ID number'}
                  value={globalTaxIdNumber}
                  onChange={e => setGlobalTaxIdNumber(e.target.value)}
                  placeholder="Enter your tax ID number"
                />
                <Button variant="primary" onClick={handleGlobalCreate} loading={submitting}>
                  Save
                </Button>
              </>
            )}
          </div>
        )}

        {globalTaxIds.length === 0 && !showGlobalForm ? (
          <div style={{ ...sectionCard, alignItems: 'center', padding: 40 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-400)' }}>
              No global tax IDs added. Click &quot;Add tax ID&quot; to get started.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--amino-gray-200)', borderRadius: 8, overflow: 'hidden' }}>
            {globalTaxIds.map(taxId => {
              const country = GLOBAL_COUNTRIES.find(c => c.code === taxId.countryCode);
              return (
                <div
                  key={taxId.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'white',
                    borderBottom: '1px solid var(--amino-gray-100)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: 'var(--amino-gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--amino-gray-600)',
                      }}
                    >
                      {taxId.countryCode}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                        {country?.label || taxId.countryCode}
                        <span style={{ fontWeight: 400, color: 'var(--amino-gray-500)', marginLeft: 8 }}>
                          {country?.taxLabel}
                        </span>
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 13, color: taxId.taxIdNumber ? 'var(--amino-gray-600)' : 'var(--amino-red-500)' }}>
                        {taxId.taxIdNumber || 'No Tax ID'}
                      </p>
                      {country?.info && (
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--amino-blue-500)' }}>
                          {country.info}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="subtle" size="sm" onClick={() => handleGlobalDelete(taxId.id)}>
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== United States Tax IDs ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={sectionTitle}>United States Tax IDs</p>

        <div
          style={{
            padding: '12px 16px',
            background: 'var(--amino-yellow-50)',
            border: '1px solid var(--amino-yellow-200)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--amino-yellow-800)',
          }}
        >
          Adding a US tax ID allows state tax calculation at checkout. Note: Zonos
          will not remit taxes or guarantee the accuracy of rates.
        </div>

        <RichCardStateSelect onClick={handleStateClick} states={states} />
      </div>

      {/* ===== State Tax ID Dialog ===== */}
      <Dialog
        open={!!selectedState}
        onClose={() => {
          setSelectedState(null);
          setStateTaxIdInput('');
        }}
        label={selectedState ? `${selectedState.name} Tax ID` : ''}
        subtitle={
          selectedState
            ? `Tax ID number registration for the state of ${selectedState.name}.`
            : ''
        }
        actions={
          <>
            <Button
              variant="subtle"
              onClick={() => {
                setSelectedState(null);
                setStateTaxIdInput('');
              }}
            >
              Close
            </Button>
            <Button variant="primary" onClick={handleStateSave} loading={submitting}>
              {selectedStateTaxId ? 'Save tax ID' : 'Add tax ID'}
            </Button>
          </>
        }
        leftActions={
          selectedStateTaxId ? (
            <Button variant="danger" onClick={handleStateDelete} loading={submitting}>
              Delete tax ID
            </Button>
          ) : undefined
        }
      >
        <Input
          label="Tax ID number"
          value={stateTaxIdInput}
          onChange={e => setStateTaxIdInput(e.target.value)}
          placeholder="Enter tax ID number"
        />
      </Dialog>
    </div>
  );
};

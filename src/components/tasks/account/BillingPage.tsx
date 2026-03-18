'use client';

import { useState, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import { useAuthStore } from '@/hooks/useAuthStore';
import {
  BILLING_ACCOUNT_QUERY,
  BILLING_COMPANY_QUERY,
  type IBillingAccountData,
  type IBillingCompanyData,
} from '@/graphql/queries/billing';
import {
  BILLING_ACCOUNT_UPDATE,
  BILLING_COMPANY_UPDATE,
} from '@/graphql/mutations/billing';
import { TaskGuidanceBanner } from '@/components/wizard/TaskGuidanceBanner';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

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

const sectionCard: React.CSSProperties = {
  padding: 24,
  background: 'white',
  borderRadius: 8,
  border: '1px solid var(--amino-gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const incompleteCard: React.CSSProperties = {
  ...sectionCard,
  border: '2px solid var(--amino-orange-400, #fb923c)',
  boxShadow: '0 0 0 3px rgba(251, 146, 60, 0.12)',
};

const IncompleteNotice = ({ text }: { text: string }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: '#c2410c',
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: 10,
    padding: '2px 8px',
    marginLeft: 8,
    verticalAlign: 'middle',
  }}>
    ⚠ {text}
  </span>
);

export const BillingPage = () => {
  const { organizationId } = useAuthStore();

  // === Fetch billing data ===
  const {
    data: accountData,
    error: accountError,
    isLoading: accountLoading,
    mutate: mutateAccount,
  } = useGraphQL<IBillingAccountData>({
    query: BILLING_ACCOUNT_QUERY,
    schema: 'internal',
  });

  const {
    data: companyData,
    error: companyError,
    isLoading: companyLoading,
    mutate: mutateCompany,
  } = useGraphQL<IBillingCompanyData>({
    query: BILLING_COMPANY_QUERY,
    schema: 'internal',
    variables: { organizationId },
  });

  // === Mutations ===
  const { execute: updateAccount } = useGraphQLMutation({
    query: BILLING_ACCOUNT_UPDATE,
    schema: 'internal',
  });
  const { execute: updateCompany } = useGraphQLMutation({
    query: BILLING_COMPANY_UPDATE,
    schema: 'internal',
  });

  // === Form state ===
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [locality, setLocality] = useState('');
  const [adminArea, setAdminArea] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const account = accountData?.billingAccount;
  const company = companyData?.billingCompany;

  useEffect(() => {
    if (account || company) {
      setCompanyName(account?.companyName || company?.name || '');
      setEmail(account?.email || company?.email || '');
      setPhone(account?.phone || '');
      setLine1(account?.address?.line1 || '');
      setLine2(account?.address?.line2 || '');
      setLocality(account?.address?.locality || '');
      setAdminArea(account?.address?.administrativeArea || '');
      setPostalCode(account?.address?.postalCode || '');
      setCountryCode(account?.address?.countryCode || 'US');
    }
  }, [account, company]);

  const handleSave = async () => {
    setSubmitting(true);
    setSubmitError('');
    setSuccess(false);

    try {
      // Update billing account (address + contact)
      await updateAccount({
        input: {
          companyName: companyName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: {
            line1: line1.trim() || undefined,
            line2: line2.trim() || undefined,
            locality: locality.trim() || undefined,
            administrativeArea: adminArea.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            countryCode: countryCode || undefined,
          },
        },
      });

      // Update billing company (name + email)
      if (company?.id) {
        await updateCompany({
          input: {
            id: company.id,
            name: companyName.trim() || undefined,
            email: email.trim() || undefined,
          },
        });
      }

      mutateAccount();
      mutateCompany();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (accountLoading || companyLoading) return <LoadingState />;

  const firstError = accountError || companyError;
  if (firstError) return <ErrorState message={firstError.message || String(firstError)} />;

  const missingBillingDetails = !companyName.trim() || !email.trim() || !line1.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 720 }}>
      <Text type="title">Billing</Text>

      <TaskGuidanceBanner
        taskId="billing"
        title="Complete your billing details"
        description="Fill out your billing contact information and address below. Payment methods and full account connections must be managed directly in the Zonos Dashboard."
      />

      {/* Info banner */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--amino-blue-50)',
          borderRadius: 8,
          border: '1px solid var(--amino-blue-200)',
          fontSize: 13,
          color: 'var(--amino-blue-700)',
        }}
      >
        Payment methods and account connections can only be managed from the{' '}
        <a
          href="https://dashboard.zonos.com/settings/dashboard/billing"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'inherit', fontWeight: 600 }}
        >
          Zonos Dashboard
        </a>{' '}
        for security reasons. You can update billing contact information and address below.
      </div>

      {/* Account standing */}
      {company?.accountStanding && (
        <div style={sectionCard}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Account standing</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                background: company.accountStanding === 'GOOD'
                  ? 'var(--amino-green-50)'
                  : 'var(--amino-red-50)',
                color: company.accountStanding === 'GOOD'
                  ? 'var(--amino-green-700)'
                  : 'var(--amino-red-700)',
              }}
            >
              {company.accountStanding}
            </span>
            {company.currency && (
              <span style={{ fontSize: 13, color: 'var(--amino-gray-500)' }}>
                Billing currency: {company.currency}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Billing details form */}
      <div style={missingBillingDetails ? incompleteCard : sectionCard}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            Billing details
            {missingBillingDetails && <IncompleteNotice text="Details incomplete" />}
          </p>
          <p style={{ fontSize: 13, color: 'var(--amino-gray-500)', margin: '4px 0 0' }}>
            Company billing contact information and address.
          </p>
        </div>

        <Input
          label="Company Name"
          value={companyName}
          onChange={e => { setCompanyName(e.target.value); setSuccess(false); }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setSuccess(false); }}
          />
          <Input
            label="Phone"
            value={phone}
            onChange={e => { setPhone(e.target.value); setSuccess(false); }}
          />
        </div>

        <Text type="bold-label">Billing Address</Text>

        <Input
          label="Address Line 1"
          value={line1}
          onChange={e => { setLine1(e.target.value); setSuccess(false); }}
        />
        <Input
          label="Address Line 2"
          value={line2}
          onChange={e => { setLine2(e.target.value); setSuccess(false); }}
          placeholder="Optional"
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <Input
            label="City"
            value={locality}
            onChange={e => { setLocality(e.target.value); setSuccess(false); }}
          />
          <Input
            label="State / Province"
            value={adminArea}
            onChange={e => { setAdminArea(e.target.value); setSuccess(false); }}
          />
          <Input
            label="Postal Code"
            value={postalCode}
            onChange={e => { setPostalCode(e.target.value); setSuccess(false); }}
          />
        </div>

        <div style={{ maxWidth: 300 }}>
          <Select
            label="Country"
            value={COUNTRY_OPTIONS.find(o => o.value === countryCode) || null}
            onChange={option => {
              if (option) { setCountryCode(option.value); setSuccess(false); }
            }}
            options={COUNTRY_OPTIONS}
          />
        </div>

        {submitError && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{submitError}</p>
        )}
        {success && (
          <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>Billing details saved.</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={handleSave} loading={submitting}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

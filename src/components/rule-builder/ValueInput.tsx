'use client';

import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import type { IRuleTokenType } from './types';

type IProps = {
  tokenType: IRuleTokenType | undefined;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  onCurrencyChange?: (currency: string) => void;
  label?: string;
};

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'CN', label: 'China' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
  { value: 'IN', label: 'India' },
  { value: 'KR', label: 'South Korea' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'CNY', label: 'CNY — Chinese Yuan' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'KRW', label: 'KRW — South Korean Won' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'SEK', label: 'SEK — Swedish Krona' },
  { value: 'NZD', label: 'NZD — New Zealand Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'HKD', label: 'HKD — Hong Kong Dollar' },
];

const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'True' },
  { value: 'false', label: 'False' },
];

export const ValueInput = ({
  tokenType,
  value,
  onChange,
  currency,
  onCurrencyChange,
  label = 'Value',
}: IProps) => {
  if (!tokenType) {
    return (
      <Input
        label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter value..."
      />
    );
  }

  // Country dropdown
  if (tokenType === 'COUNTRY' || tokenType === 'COUNTRY_LIST') {
    return (
      <Select
        label={label}
        value={COUNTRY_OPTIONS.find(o => o.value === value) || null}
        onChange={option => {
          if (option) onChange(option.value);
        }}
        options={COUNTRY_OPTIONS}
        placeholder="Select country..."
      />
    );
  }

  // Currency dropdown
  if (tokenType === 'CURRENCY' || tokenType === 'CURRENCY_LIST') {
    return (
      <Select
        label={label}
        value={CURRENCY_OPTIONS.find(o => o.value === value) || null}
        onChange={option => {
          if (option) onChange(option.value);
        }}
        options={CURRENCY_OPTIONS}
        placeholder="Select currency..."
      />
    );
  }

  // Boolean toggle
  if (tokenType === 'BOOLEAN' || tokenType === 'BOOLEAN_LIST') {
    return (
      <Select
        label={label}
        value={BOOLEAN_OPTIONS.find(o => o.value === value) || null}
        onChange={option => {
          if (option) onChange(option.value);
        }}
        options={BOOLEAN_OPTIONS}
      />
    );
  }

  // Money: number input + currency selector
  if (tokenType === 'MONEY' || tokenType === 'MONEY_LIST') {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <Input
            label={label}
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="0.00"
          />
        </div>
        {onCurrencyChange && (
          <div style={{ width: 120 }}>
            <Select
              label="Currency"
              value={
                CURRENCY_OPTIONS.find(o => o.value === (currency || 'USD')) ||
                null
              }
              onChange={option => {
                if (option) onCurrencyChange(option.value);
              }}
              options={CURRENCY_OPTIONS}
            />
          </div>
        )}
      </div>
    );
  }

  // Numeric types
  if (
    tokenType === 'NUMBER' ||
    tokenType === 'WEIGHT' ||
    tokenType === 'LENGTH' ||
    tokenType === 'VOLUME' ||
    tokenType === 'NUMBER_LIST' ||
    tokenType === 'WEIGHT_LIST' ||
    tokenType === 'LENGTH_LIST' ||
    tokenType === 'VOLUME_LIST'
  ) {
    return (
      <Input
        label={label}
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0"
      />
    );
  }

  // Default: string / list text input
  return (
    <Input
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={
        tokenType?.endsWith('_LIST')
          ? 'Comma-separated values...'
          : 'Enter value...'
      }
    />
  );
};

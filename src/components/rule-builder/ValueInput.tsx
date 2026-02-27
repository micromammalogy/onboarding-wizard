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
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'cn', label: 'China' },
  { value: 'mx', label: 'Mexico' },
  { value: 'br', label: 'Brazil' },
  { value: 'in', label: 'India' },
  { value: 'kr', label: 'South Korea' },
  { value: 'it', label: 'Italy' },
  { value: 'es', label: 'Spain' },
  { value: 'nl', label: 'Netherlands' },
  { value: 'se', label: 'Sweden' },
  { value: 'ch', label: 'Switzerland' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'sg', label: 'Singapore' },
  { value: 'hk', label: 'Hong Kong' },
];

const CURRENCY_OPTIONS = [
  { value: 'usd', label: 'USD — US Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
  { value: 'gbp', label: 'GBP — British Pound' },
  { value: 'cad', label: 'CAD — Canadian Dollar' },
  { value: 'aud', label: 'AUD — Australian Dollar' },
  { value: 'jpy', label: 'JPY — Japanese Yen' },
  { value: 'cny', label: 'CNY — Chinese Yuan' },
  { value: 'mxn', label: 'MXN — Mexican Peso' },
  { value: 'brl', label: 'BRL — Brazilian Real' },
  { value: 'inr', label: 'INR — Indian Rupee' },
  { value: 'krw', label: 'KRW — South Korean Won' },
  { value: 'chf', label: 'CHF — Swiss Franc' },
  { value: 'sek', label: 'SEK — Swedish Krona' },
  { value: 'nzd', label: 'NZD — New Zealand Dollar' },
  { value: 'sgd', label: 'SGD — Singapore Dollar' },
  { value: 'hkd', label: 'HKD — Hong Kong Dollar' },
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
  // No type selected — disabled placeholder
  if (!tokenType) {
    return (
      <Input
        label={label}
        value=""
        onChange={() => {}}
        placeholder="Select a variable first"
        disabled
      />
    );
  }

  // Country dropdown — lowercase values
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

  // Currency dropdown — lowercase values
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

  // Boolean — dropdown only, no free text
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

  // Money: number input + required currency selector
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
          <div style={{ width: 140 }}>
            <Select
              label="Currency"
              value={
                CURRENCY_OPTIONS.find(
                  o => o.value === (currency || 'usd'),
                ) || null
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

  // Numeric types — number input only
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

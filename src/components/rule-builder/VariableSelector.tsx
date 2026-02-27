'use client';

import { useMemo } from 'react';
import { Select } from '@zonos/amino/components/select/Select';
import type { IRuleToken } from './types';

type IProps = {
  tokens: IRuleToken[];
  value: string;
  onChange: (tokenName: string) => void;
  label?: string;
  placeholder?: string;
};

export const VariableSelector = ({
  tokens,
  value,
  onChange,
  label = 'Variable',
  placeholder = 'Select variable...',
}: IProps) => {
  const options = useMemo(
    () =>
      tokens.map(t => ({
        value: t.value,
        label: t.value.replace(/_/g, ' '),
        description: t.description,
      })),
    [tokens],
  );

  const selectedOption = options.find(o => o.value === value) || null;

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={selectedOption}
      onChange={option => {
        if (option) onChange(option.value);
      }}
      options={options}
    />
  );
};

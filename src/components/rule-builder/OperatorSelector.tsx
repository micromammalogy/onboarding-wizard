'use client';

import { useMemo } from 'react';
import { Select } from '@zonos/amino/components/select/Select';
import type { IConditionOperator, IRuleTokenType } from './types';
import { OPERATORS_BY_TYPE, OPERATOR_LABELS } from './types';

type IProps = {
  tokenType: IRuleTokenType | undefined;
  value: IConditionOperator;
  onChange: (operator: IConditionOperator) => void;
};

export const OperatorSelector = ({ tokenType, value, onChange }: IProps) => {
  const operators = useMemo(() => {
    if (!tokenType) return Object.keys(OPERATOR_LABELS) as IConditionOperator[];
    return OPERATORS_BY_TYPE[tokenType] || (['==', '!='] as IConditionOperator[]);
  }, [tokenType]);

  const options = useMemo(
    () =>
      operators.map(op => ({
        value: op,
        label: OPERATOR_LABELS[op],
      })),
    [operators],
  );

  const selectedOption = options.find(o => o.value === value) || null;

  return (
    <Select
      label="Operator"
      value={selectedOption}
      onChange={option => {
        if (option) onChange(option.value as IConditionOperator);
      }}
      options={options}
    />
  );
};

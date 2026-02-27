'use client';

import { useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { VariableSelector } from './VariableSelector';
import { OperatorSelector } from './OperatorSelector';
import { ValueInput } from './ValueInput';
import type {
  IRuleCondition,
  IRuleToken,
  IRuleTokenType,
  IConditionConnector,
} from './types';
import { OPERATORS_BY_TYPE } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  condition: IRuleCondition;
  tokens: IRuleToken[];
  onChange: (updated: IRuleCondition) => void;
  onRemove: () => void;
  showConnector: boolean;
  canRemove: boolean;
};

const CONNECTOR_OPTIONS = [
  { value: 'and', label: 'AND' },
  { value: 'or', label: 'OR' },
];

export const ConditionRow = ({
  condition,
  tokens,
  onChange,
  onRemove,
  showConnector,
  canRemove,
}: IProps) => {
  const selectedToken = tokens.find(t => t.value === condition.variable);

  const handleVariableChange = useCallback(
    (variable: string) => {
      const newToken = tokens.find(t => t.value === variable);
      const newType = newToken?.ruleTokenType as string | undefined;
      const validOperators = newType ? OPERATORS_BY_TYPE[newType] || [] : [];

      // Check if current operator is still valid for the new type
      const currentOperatorValid = validOperators.includes(condition.operator);

      onChange({
        ...condition,
        variable,
        // Reset operator if invalid for new type, or default to first valid
        operator: currentOperatorValid
          ? condition.operator
          : validOperators[0] || '==',
        // Always clear value — old value is meaningless for a different type
        value: '',
      });
    },
    [condition, tokens, onChange],
  );

  return (
    <div className={styles.conditionRow}>
      <div className={styles.conditionFields}>
        <div className={styles.fieldVariable}>
          <VariableSelector
            tokens={tokens}
            value={condition.variable}
            onChange={handleVariableChange}
            label="Variable"
          />
        </div>
        <div className={styles.fieldOperator}>
          <OperatorSelector
            tokenType={selectedToken?.ruleTokenType as IRuleTokenType | undefined}
            value={condition.operator}
            onChange={operator => onChange({ ...condition, operator })}
          />
        </div>
        <div className={styles.fieldValue}>
          <ValueInput
            tokenType={selectedToken?.ruleTokenType as IRuleTokenType | undefined}
            value={condition.value}
            onChange={value => onChange({ ...condition, value })}
            label="Value"
          />
        </div>
        {canRemove && (
          <div className={styles.fieldRemove}>
            <Button
              size="sm"
              variant="subtle"
              onClick={onRemove}
              style={{ marginTop: 22 }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      {showConnector && (
        <div className={styles.connectorRow}>
          <Select
            label=""
            value={
              CONNECTOR_OPTIONS.find(o => o.value === condition.connector) ||
              null
            }
            onChange={option => {
              if (option)
                onChange({
                  ...condition,
                  connector: option.value as IConditionConnector,
                });
            }}
            options={CONNECTOR_OPTIONS}
          />
        </div>
      )}
    </div>
  );
};

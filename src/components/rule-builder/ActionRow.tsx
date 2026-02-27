'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { VariableSelector } from './VariableSelector';
import { ValueInput } from './ValueInput';
import type { IRuleAction, IRuleToken, IRuleTokenType, IActionOperation } from './types';
import { ACTION_OPERATION_LABELS, OPERATIONS_BY_TYPE } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  action: IRuleAction;
  tokens: IRuleToken[];
  onChange: (updated: IRuleAction) => void;
  onRemove: () => void;
  canRemove: boolean;
};

export const ActionRow = ({
  action,
  tokens,
  onChange,
  onRemove,
  canRemove,
}: IProps) => {
  const selectedToken = tokens.find(t => t.value === action.variable);
  const tokenType = selectedToken?.ruleTokenType as string | undefined;
  const isMoney = tokenType === 'MONEY' || tokenType === 'MONEY_LIST';

  // Filter operation options based on selected variable's type
  const operationOptions = useMemo(() => {
    if (!tokenType) {
      // No variable selected — show all but disabled
      return Object.entries(ACTION_OPERATION_LABELS).map(([value, label]) => ({
        value,
        label,
      }));
    }
    const validOps = OPERATIONS_BY_TYPE[tokenType] || ['set'];
    return validOps.map(op => ({
      value: op,
      label: ACTION_OPERATION_LABELS[op],
    }));
  }, [tokenType]);

  const handleVariableChange = useCallback(
    (variable: string) => {
      const newToken = tokens.find(t => t.value === variable);
      const newType = newToken?.ruleTokenType as string | undefined;
      const newIsMoney = newType === 'MONEY' || newType === 'MONEY_LIST';

      onChange({
        ...action,
        variable,
        // Reset operation to 'set' (always valid for all types)
        operation: 'set',
        value: '',
        // Auto-set currency for MONEY types, clear for non-MONEY
        currency: newIsMoney ? action.currency || 'usd' : undefined,
      });
    },
    [action, tokens, onChange],
  );

  return (
    <div className={styles.actionRow}>
      <div className={styles.conditionFields}>
        <div className={styles.fieldVariable}>
          <VariableSelector
            tokens={tokens}
            value={action.variable}
            onChange={handleVariableChange}
            label="Variable"
          />
        </div>
        <div className={styles.fieldOperator}>
          <Select
            label="Operation"
            value={
              operationOptions.find(o => o.value === action.operation) || null
            }
            onChange={option => {
              if (option)
                onChange({
                  ...action,
                  operation: option.value as IActionOperation,
                });
            }}
            options={operationOptions}
            isDisabled={!tokenType}
            placeholder={!tokenType ? 'Select a variable first' : undefined}
          />
        </div>
        <div className={styles.fieldValue}>
          <ValueInput
            tokenType={selectedToken?.ruleTokenType as IRuleTokenType | undefined}
            value={action.value}
            onChange={value => onChange({ ...action, value })}
            currency={action.currency}
            onCurrencyChange={
              isMoney
                ? currency => onChange({ ...action, currency })
                : undefined
            }
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
    </div>
  );
};

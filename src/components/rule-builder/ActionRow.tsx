'use client';

import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { VariableSelector } from './VariableSelector';
import { ValueInput } from './ValueInput';
import type { IRuleAction, IRuleToken, IRuleTokenType, IActionOperation } from './types';
import { ACTION_OPERATION_LABELS } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  action: IRuleAction;
  tokens: IRuleToken[];
  onChange: (updated: IRuleAction) => void;
  onRemove: () => void;
  canRemove: boolean;
};

const OPERATION_OPTIONS = Object.entries(ACTION_OPERATION_LABELS).map(
  ([value, label]) => ({ value, label }),
);

export const ActionRow = ({
  action,
  tokens,
  onChange,
  onRemove,
  canRemove,
}: IProps) => {
  const selectedToken = tokens.find(t => t.value === action.variable);

  return (
    <div className={styles.actionRow}>
      <div className={styles.conditionFields}>
        <div className={styles.fieldVariable}>
          <VariableSelector
            tokens={tokens}
            value={action.variable}
            onChange={variable =>
              onChange({ ...action, variable, value: '', currency: undefined })
            }
            label="Variable"
          />
        </div>
        <div className={styles.fieldOperator}>
          <Select
            label="Operation"
            value={
              OPERATION_OPTIONS.find(o => o.value === action.operation) || null
            }
            onChange={option => {
              if (option)
                onChange({
                  ...action,
                  operation: option.value as IActionOperation,
                });
            }}
            options={OPERATION_OPTIONS}
          />
        </div>
        <div className={styles.fieldValue}>
          <ValueInput
            tokenType={selectedToken?.ruleTokenType as IRuleTokenType | undefined}
            value={action.value}
            onChange={value => onChange({ ...action, value })}
            currency={action.currency}
            onCurrencyChange={currency => onChange({ ...action, currency })}
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

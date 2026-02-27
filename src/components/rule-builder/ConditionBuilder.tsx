'use client';

import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { ConditionRow } from './ConditionRow';
import type { IRuleCondition, IRuleToken } from './types';
import { createEmptyCondition } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  conditions: IRuleCondition[];
  tokens: IRuleToken[];
  onChange: (conditions: IRuleCondition[]) => void;
};

export const ConditionBuilder = ({ conditions, tokens, onChange }: IProps) => {
  const handleConditionChange = (index: number, updated: IRuleCondition) => {
    const next = [...conditions];
    next[index] = updated;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (conditions.length <= 1) return;
    onChange(conditions.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...conditions, createEmptyCondition()]);
  };

  return (
    <div className={styles.builderBlock}>
      <div className={styles.blockHeader}>
        <Text type="bold-label" color="blue600">
          IF
        </Text>
      </div>
      <div className={styles.blockBody}>
        {conditions.map((condition, index) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            tokens={tokens}
            onChange={updated => handleConditionChange(index, updated)}
            onRemove={() => handleRemove(index)}
            showConnector={index < conditions.length - 1}
            canRemove={conditions.length > 1}
          />
        ))}
        <Button size="sm" variant="subtle" onClick={handleAdd}>
          + Add condition
        </Button>
      </div>
    </div>
  );
};

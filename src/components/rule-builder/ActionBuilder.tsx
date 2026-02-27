'use client';

import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { ActionRow } from './ActionRow';
import type { IRuleAction, IRuleToken } from './types';
import { createEmptyAction } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  actions: IRuleAction[];
  tokens: IRuleToken[];
  onChange: (actions: IRuleAction[]) => void;
};

export const ActionBuilder = ({ actions, tokens, onChange }: IProps) => {
  const handleActionChange = (index: number, updated: IRuleAction) => {
    const next = [...actions];
    next[index] = updated;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (actions.length <= 1) return;
    onChange(actions.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...actions, createEmptyAction()]);
  };

  return (
    <div className={styles.builderBlock}>
      <div className={styles.blockHeaderThen}>
        <Text type="bold-label" color="green700">
          THEN
        </Text>
      </div>
      <div className={styles.blockBody}>
        {actions.map((action, index) => (
          <ActionRow
            key={action.id}
            action={action}
            tokens={tokens}
            onChange={updated => handleActionChange(index, updated)}
            onRemove={() => handleRemove(index)}
            canRemove={actions.length > 1}
          />
        ))}
        <Button size="sm" variant="subtle" onClick={handleAdd}>
          + Add action
        </Button>
      </div>
    </div>
  );
};

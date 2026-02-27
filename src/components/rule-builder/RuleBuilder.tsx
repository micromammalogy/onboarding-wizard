'use client';

import { useMemo } from 'react';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { ConditionBuilder } from './ConditionBuilder';
import { ActionBuilder } from './ActionBuilder';
import { RulePreview } from './RulePreview';
import { RuleDateRange } from './RuleDateRange';
import { useRuleContexts } from './useRuleContexts';
import type { IStructuredRule, IRuleCondition, IRuleAction } from './types';
import { CONTEXT_LABELS, createEmptyCondition, createEmptyAction } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  rule: IStructuredRule;
  onChange: (rule: IStructuredRule) => void;
};

export const RuleBuilder = ({ rule, onChange }: IProps) => {
  const {
    contexts,
    getConditionTokens,
    getAssignableTokens,
    getTokenLabels,
  } = useRuleContexts();

  const contextOptions = useMemo(
    () =>
      contexts.map(ctx => ({
        value: ctx.name,
        label: CONTEXT_LABELS[ctx.name] || ctx.name,
      })),
    [contexts],
  );

  const conditionTokens = useMemo(
    () => (rule.context ? getConditionTokens(rule.context) : []),
    [rule.context, getConditionTokens],
  );

  const assignableTokens = useMemo(
    () => (rule.context ? getAssignableTokens(rule.context) : []),
    [rule.context, getAssignableTokens],
  );

  const tokenLabels = useMemo(
    () => (rule.context ? getTokenLabels(rule.context) : {}),
    [rule.context, getTokenLabels],
  );

  const handleContextChange = (context: string) => {
    // Reset conditions and actions when context changes (variables differ)
    onChange({
      ...rule,
      context,
      conditions: [createEmptyCondition()],
      actions: [createEmptyAction()],
    });
  };

  return (
    <div className={styles.builder}>
      {/* Name + Description */}
      <div className={styles.builderSection}>
        <Input
          label="Rule name"
          value={rule.name}
          onChange={e => onChange({ ...rule, name: e.target.value })}
          placeholder="e.g. US UPS rate increase"
        />
        <Input
          label="Description"
          value={rule.description}
          onChange={e => onChange({ ...rule, description: e.target.value })}
          placeholder="What does this rule do?"
        />
      </div>

      {/* Context selector */}
      <div className={styles.builderSection}>
        <Select
          label="Rule context"
          value={contextOptions.find(o => o.value === rule.context) || null}
          onChange={option => {
            if (option) handleContextChange(option.value);
          }}
          options={contextOptions}
          placeholder="Select when this rule runs..."
        />
      </div>

      {/* Conditions (IF) */}
      {rule.context && (
        <ConditionBuilder
          conditions={rule.conditions}
          tokens={conditionTokens}
          onChange={(conditions: IRuleCondition[]) =>
            onChange({ ...rule, conditions })
          }
        />
      )}

      {/* Actions (THEN) */}
      {rule.context && (
        <ActionBuilder
          actions={rule.actions}
          tokens={assignableTokens}
          onChange={(actions: IRuleAction[]) =>
            onChange({ ...rule, actions })
          }
        />
      )}

      {/* Preview */}
      {rule.context && (
        <RulePreview rule={rule} tokenLabels={tokenLabels} />
      )}

      {/* Date range */}
      {rule.context && (
        <RuleDateRange
          startsAt={rule.startsAt}
          endsAt={rule.endsAt}
          onStartsAtChange={startsAt => onChange({ ...rule, startsAt })}
          onEndsAtChange={endsAt => onChange({ ...rule, endsAt })}
        />
      )}
    </div>
  );
};

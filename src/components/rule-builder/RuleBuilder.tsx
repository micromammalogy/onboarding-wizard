'use client';

import { useMemo, useCallback } from 'react';
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
  isEditing?: boolean;
  onDateError?: (hasError: boolean) => void;
};

export const RuleBuilder = ({ rule, onChange, isEditing, onDateError }: IProps) => {
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

  const hasConditionOrActionData = useMemo(() => {
    const hasConditionData = rule.conditions.some(
      c => c.variable || c.value,
    );
    const hasActionData = rule.actions.some(a => a.variable || a.value);
    return hasConditionData || hasActionData;
  }, [rule.conditions, rule.actions]);

  const handleContextChange = useCallback(
    (context: string) => {
      // If there's existing data, confirm before resetting
      if (hasConditionOrActionData) {
        const confirmed = window.confirm(
          'Changing the context will reset all conditions and actions. Continue?',
        );
        if (!confirmed) return;
      }

      onChange({
        ...rule,
        context,
        conditions: [createEmptyCondition()],
        actions: [createEmptyAction()],
      });
    },
    [rule, onChange, hasConditionOrActionData],
  );

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
          isDisabled={isEditing}
        />
        {isEditing && (
          <Text type="caption" color="gray600">
            Context cannot be changed after creation
          </Text>
        )}
      </div>

      {/* Conditions (IF) — disabled until context selected */}
      {rule.context ? (
        <ConditionBuilder
          conditions={rule.conditions}
          tokens={conditionTokens}
          onChange={(conditions: IRuleCondition[]) =>
            onChange({ ...rule, conditions })
          }
        />
      ) : (
        <div className={styles.builderSection} style={{ opacity: 0.5 }}>
          <Text type="bold-label" color="gray600">
            IF (conditions)
          </Text>
          <Text type="caption" color="gray500">
            Select a context above to configure conditions
          </Text>
        </div>
      )}

      {/* Actions (THEN) — disabled until context selected */}
      {rule.context ? (
        <ActionBuilder
          actions={rule.actions}
          tokens={assignableTokens}
          onChange={(actions: IRuleAction[]) =>
            onChange({ ...rule, actions })
          }
        />
      ) : (
        <div className={styles.builderSection} style={{ opacity: 0.5 }}>
          <Text type="bold-label" color="gray600">
            THEN (actions)
          </Text>
          <Text type="caption" color="gray500">
            Select a context above to configure actions
          </Text>
        </div>
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
          onError={onDateError}
        />
      )}
    </div>
  );
};

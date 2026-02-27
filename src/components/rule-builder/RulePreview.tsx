'use client';

import { useMemo } from 'react';
import { Text } from '@zonos/amino/components/text/Text';
import type { IStructuredRule } from './types';
import { buildConditionString, buildActionStrings, buildHumanReadable } from './ruleExpression';
import styles from './RuleBuilder.module.scss';

type IProps = {
  rule: IStructuredRule;
  tokenLabels: Record<string, string>;
};

export const RulePreview = ({ rule, tokenLabels }: IProps) => {
  const validConditions = rule.conditions.filter(c => c.variable && c.value);
  const validActions = rule.actions.filter(a => a.variable && a.value);

  const humanReadable = useMemo(
    () => buildHumanReadable(rule, tokenLabels),
    [rule, tokenLabels],
  );

  const rawCondition = useMemo(
    () => buildConditionString(validConditions),
    [validConditions],
  );

  const rawActions = useMemo(
    () => buildActionStrings(validActions),
    [validActions],
  );

  const isEmpty = !humanReadable && !rawCondition && rawActions.length === 0;

  if (isEmpty) {
    return (
      <div className={styles.previewBlock}>
        <Text type="bold-label" color="gray500">
          Preview
        </Text>
        <p className={styles.previewEmpty}>
          Configure conditions and actions above to see a preview.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.previewBlock}>
      <Text type="bold-label" color="gray700">
        Preview
      </Text>

      {humanReadable && (
        <p className={styles.previewHuman}>{humanReadable}</p>
      )}

      <div className={styles.previewRaw}>
        {rawCondition && (
          <div className={styles.previewRawLine}>
            <span className={styles.previewLabel}>Condition:</span>
            <code>{rawCondition}</code>
          </div>
        )}
        {rawActions.map((action, i) => (
          <div key={i} className={styles.previewRawLine}>
            <span className={styles.previewLabel}>
              {i === 0 ? 'Action:' : ''}
            </span>
            <code>{action}</code>
          </div>
        ))}
      </div>
    </div>
  );
};

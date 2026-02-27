'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { RuleBuilder } from './RuleBuilder';
import { structuredRuleToAPI } from './ruleExpression';
import { parseRuleFromAPI } from './ruleParser';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import { RULE_VALIDATE } from '@/graphql/mutations/rules';
import { RULE_CREATE, RULE_UPDATE } from '@/graphql/mutations/rules';
import type {
  IStructuredRule,
  IRuleFromAPI,
  IRuleValidateData,
  IRuleCreateData,
  IRuleUpdateData,
} from './types';
import { createEmptyRule } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingRule: IRuleFromAPI | null;
};

export const RuleBuilderSlideover = ({
  open,
  onClose,
  onSaved,
  editingRule,
}: IProps) => {
  const [rule, setRule] = useState<IStructuredRule>(createEmptyRule());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { execute: validateRule, isLoading: validating } =
    useGraphQLMutation<IRuleValidateData>({
      query: RULE_VALIDATE,
      schema: 'internal',
    });

  const { execute: createRule, isLoading: creating } =
    useGraphQLMutation<IRuleCreateData>({
      query: RULE_CREATE,
      schema: 'internal',
    });

  const { execute: updateRule, isLoading: updating } =
    useGraphQLMutation<IRuleUpdateData>({
      query: RULE_UPDATE,
      schema: 'internal',
    });

  // Populate form when editing
  useEffect(() => {
    if (editingRule) {
      setRule(parseRuleFromAPI(editingRule));
    } else {
      setRule(createEmptyRule());
    }
    setValidationErrors([]);
    setValidationSuccess(false);
    setSaveError('');
  }, [editingRule, open]);

  const handleValidate = useCallback(async () => {
    setValidationErrors([]);
    setValidationSuccess(false);

    const apiInput = structuredRuleToAPI(rule);

    try {
      const result = await validateRule({ input: apiInput });
      if (result?.ruleValidate === 'SUCCESS') {
        setValidationSuccess(true);
      } else {
        setValidationErrors(['Validation failed']);
      }
    } catch (err) {
      setValidationErrors([
        err instanceof Error ? err.message : 'Validation request failed',
      ]);
    }
  }, [rule, validateRule]);

  const handleSave = useCallback(async () => {
    setSaveError('');

    const apiInput = structuredRuleToAPI(rule);

    try {
      if (editingRule) {
        await updateRule({ input: { ...apiInput, id: editingRule.id } });
      } else {
        await createRule({ input: apiInput });
      }
      onSaved();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    }
  }, [rule, editingRule, createRule, updateRule, onSaved, onClose]);

  const isValid =
    rule.name.trim() &&
    rule.context &&
    rule.conditions.some(c => c.variable && c.value) &&
    rule.actions.some(a => a.variable && a.value);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.slideoverBackdrop} onClick={onClose} />

      {/* Panel */}
      <div className={styles.slideover}>
        <div className={styles.slideoverHeader}>
          <Text type="subtitle">
            {editingRule ? 'Edit Rule' : 'New Rule'}
          </Text>
          <Button size="sm" variant="subtle" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className={styles.slideoverBody}>
          <RuleBuilder rule={rule} onChange={setRule} />
        </div>

        <div className={styles.slideoverFooter}>
          {/* Validation feedback */}
          {validationErrors.length > 0 && (
            <div className={styles.validationErrors}>
              {validationErrors.map((err, i) => (
                <p key={i} className={styles.errorText}>
                  {err}
                </p>
              ))}
            </div>
          )}
          {validationSuccess && (
            <p className={styles.successText}>Rule is valid</p>
          )}
          {saveError && <p className={styles.errorText}>{saveError}</p>}

          <div className={styles.footerActions}>
            <Button
              variant="subtle"
              onClick={handleValidate}
              loading={validating}
              disabled={!isValid}
            >
              Validate
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={creating || updating}
              disabled={!isValid}
            >
              {editingRule ? 'Update Rule' : 'Save Rule'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

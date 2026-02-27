'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { RuleBuilder } from './RuleBuilder';
import { structuredRuleToAPI } from './ruleExpression';
import type { ITokenTypeMap } from './ruleExpression';
import { parseRuleFromAPI } from './ruleParser';
import { useRuleContexts } from './useRuleContexts';
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
import { createEmptyRule, OPERATORS_BY_TYPE, OPERATIONS_BY_TYPE } from './types';
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
  const [dateError, setDateError] = useState(false);

  const { findToken, getTokensForContext } = useRuleContexts();

  // Build a map of variable name → token type for the current context
  const tokenTypeMap: ITokenTypeMap = useMemo(() => {
    if (!rule.context) return {};
    const tokens = getTokensForContext(rule.context);
    return tokens.reduce<ITokenTypeMap>((acc, t) => {
      acc[t.value] = t.ruleTokenType;
      return acc;
    }, {});
  }, [rule.context, getTokensForContext]);

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
    setDateError(false);
  }, [editingRule, open]);

  const handleValidate = useCallback(async () => {
    setValidationErrors([]);
    setValidationSuccess(false);

    const apiInput = structuredRuleToAPI(rule, tokenTypeMap);

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
  }, [rule, tokenTypeMap, validateRule]);

  const handleSave = useCallback(async () => {
    setSaveError('');

    const apiInput = structuredRuleToAPI(rule, tokenTypeMap);

    try {
      if (editingRule) {
        // RuleUpdateInput doesn't accept context — it's immutable after creation
        const { context: _context, ...updateFields } = apiInput;
        await updateRule({ input: { ...updateFields, id: editingRule.id } });
      } else {
        await createRule({ input: apiInput });
      }
      onSaved();
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    }
  }, [rule, tokenTypeMap, editingRule, createRule, updateRule, onSaved, onClose]);

  // Enhanced validation with specific reasons
  const { isValid, invalidReason } = useMemo(() => {
    if (!rule.name.trim()) {
      return { isValid: false, invalidReason: 'Rule name is required' };
    }
    if (!rule.context) {
      return { isValid: false, invalidReason: 'Select a rule context' };
    }

    // Validate all conditions
    for (let i = 0; i < rule.conditions.length; i++) {
      const c = rule.conditions[i];
      if (!c.variable) {
        return {
          isValid: false,
          invalidReason: `Condition ${i + 1}: select a variable`,
        };
      }
      // Check operator is valid for the variable's type
      const condToken = findToken(rule.context, c.variable);
      const condType = condToken?.ruleTokenType;
      if (condType) {
        const validOps = OPERATORS_BY_TYPE[condType] || [];
        if (!validOps.includes(c.operator)) {
          return {
            isValid: false,
            invalidReason: `Condition ${i + 1}: invalid operator for ${condType}`,
          };
        }
      }
      if (!c.value) {
        return {
          isValid: false,
          invalidReason: `Condition ${i + 1}: enter a value`,
        };
      }
    }

    // Validate all actions
    for (let i = 0; i < rule.actions.length; i++) {
      const a = rule.actions[i];
      if (!a.variable) {
        return {
          isValid: false,
          invalidReason: `Action ${i + 1}: select a variable`,
        };
      }
      // Check operation is valid for the variable's type
      const actToken = findToken(rule.context, a.variable);
      const actType = actToken?.ruleTokenType;
      if (actType) {
        const validOps = OPERATIONS_BY_TYPE[actType] || ['set'];
        if (!validOps.includes(a.operation)) {
          return {
            isValid: false,
            invalidReason: `Action ${i + 1}: invalid operation for ${actType}`,
          };
        }
        // MONEY actions require currency
        if (
          (actType === 'MONEY' || actType === 'MONEY_LIST') &&
          !a.currency
        ) {
          return {
            isValid: false,
            invalidReason: `Action ${i + 1}: currency is required for money values`,
          };
        }
      }
      if (!a.value) {
        return {
          isValid: false,
          invalidReason: `Action ${i + 1}: enter a value`,
        };
      }
    }

    // Date validation
    if (dateError) {
      return {
        isValid: false,
        invalidReason: 'End date must be after start date',
      };
    }

    return { isValid: true, invalidReason: null };
  }, [rule, dateError, findToken]);

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
          <RuleBuilder
            rule={rule}
            onChange={setRule}
            isEditing={!!editingRule}
            onDateError={setDateError}
          />
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

          {/* Show why save is disabled */}
          {!isValid && invalidReason && (
            <Text type="caption" color="gray600">
              {invalidReason}
            </Text>
          )}

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

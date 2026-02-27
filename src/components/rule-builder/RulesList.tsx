'use client';

import { useMemo } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import { RULE_ARCHIVE } from '@/graphql/mutations/rules';
import type { IRuleFromAPI, IRuleArchiveData } from './types';
import { CONTEXT_LABELS } from './types';
import styles from './RuleBuilder.module.scss';

type IProps = {
  rules: IRuleFromAPI[];
  contextFilter: string;
  onContextFilterChange: (context: string) => void;
  onEdit: (rule: IRuleFromAPI) => void;
  onDeleted: () => void;
};

const ALL_CONTEXT_OPTION = { value: '', label: 'All contexts' };

export const RulesList = ({
  rules,
  contextFilter,
  onContextFilterChange,
  onEdit,
  onDeleted,
}: IProps) => {
  const { execute: archiveRule, isLoading: archiving } =
    useGraphQLMutation<IRuleArchiveData>({
      query: RULE_ARCHIVE,
      schema: 'internal',
    });

  const contextOptions = useMemo(() => {
    const uniqueContexts = [...new Set(rules.map(r => r.context))];
    return [
      ALL_CONTEXT_OPTION,
      ...uniqueContexts.map(c => ({
        value: c,
        label: CONTEXT_LABELS[c] || c,
      })),
    ];
  }, [rules]);

  const filteredRules = useMemo(
    () =>
      contextFilter
        ? rules.filter(r => r.context === contextFilter)
        : rules,
    [rules, contextFilter],
  );

  const handleDelete = async (rule: IRuleFromAPI) => {
    if (!confirm(`Archive rule "${rule.name}"?`)) return;
    try {
      await archiveRule({ id: rule.id });
      onDeleted();
    } catch {
      // error captured in hook
    }
  };

  if (rules.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Text type="subtitle" color="gray500">
          No rules yet
        </Text>
        <p
          style={{
            fontSize: 14,
            color: 'var(--amino-gray-400)',
            marginTop: 8,
          }}
        >
          Create your first rule to start automating shipping, pricing, and
          more.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter bar */}
      <div style={{ maxWidth: 260 }}>
        <Select
          label="Filter by context"
          value={
            contextOptions.find(o => o.value === contextFilter) ||
            ALL_CONTEXT_OPTION
          }
          onChange={option =>
            onContextFilterChange(option?.value || '')
          }
          options={contextOptions}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--amino-gray-200)' }}>
              {['Name', 'Context', 'Actions'].map(h => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '10px 16px',
                    fontSize: 12,
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    color: 'var(--amino-gray-500)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRules.map(rule => (
              <tr
                key={rule.id}
                style={{
                  borderBottom: '1px solid var(--amino-gray-100)',
                }}
              >
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <div style={{ fontWeight: 500 }}>{rule.name}</div>
                  {rule.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--amino-gray-400)',
                        marginTop: 2,
                      }}
                    >
                      {rule.description}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 14 }}>
                  <span className={styles.contextBadge}>
                    {CONTEXT_LABELS[rule.context] || rule.context}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      size="sm"
                      variant="subtle"
                      onClick={() => onEdit(rule)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(rule)}
                      loading={archiving}
                    >
                      Archive
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

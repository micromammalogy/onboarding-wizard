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

type IRuleStatus = 'active' | 'expired' | 'scheduled';

type IProps = {
  rules: IRuleFromAPI[];
  statusFilter: IRuleStatus;
  onStatusFilterChange: (status: IRuleStatus) => void;
  onEdit: (rule: IRuleFromAPI) => void;
  onDeleted: () => void;
};

const STATUS_OPTIONS: { value: IRuleStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
];

function getRuleStatus(rule: IRuleFromAPI): IRuleStatus {
  const now = new Date();
  if (rule.endsAt && new Date(rule.endsAt) < now) {
    return 'expired';
  }
  if (rule.startsAt && new Date(rule.startsAt) > now) {
    return 'scheduled';
  }
  return 'active';
}

const STATUS_STYLES: Record<IRuleStatus, { bg: string; color: string }> = {
  active: { bg: 'var(--amino-green-50)', color: 'var(--amino-green-700)' },
  expired: { bg: 'var(--amino-gray-100)', color: 'var(--amino-gray-500)' },
  scheduled: { bg: 'var(--amino-blue-50)', color: 'var(--amino-blue-700)' },
};

export const RulesList = ({
  rules,
  statusFilter,
  onStatusFilterChange,
  onEdit,
  onDeleted,
}: IProps) => {
  const { execute: archiveRule, isLoading: archiving } =
    useGraphQLMutation<IRuleArchiveData>({
      query: RULE_ARCHIVE,
      schema: 'internal',
    });

  const filteredRules = useMemo(
    () => rules.filter(r => getRuleStatus(r) === statusFilter),
    [rules, statusFilter],
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
          label="Status"
          value={STATUS_OPTIONS.find(o => o.value === statusFilter) || STATUS_OPTIONS[0]}
          onChange={option => {
            if (option) onStatusFilterChange(option.value as IRuleStatus);
          }}
          options={STATUS_OPTIONS}
        />
      </div>

      {/* Table */}
      {filteredRules.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            background: 'white',
            borderRadius: 8,
            border: '1px solid var(--amino-gray-200)',
          }}
        >
          <Text type="subtitle" color="gray500">
            No {statusFilter} rules
          </Text>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--amino-gray-200)' }}>
                {['Name', 'Status', 'Context', 'Actions'].map(h => (
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
              {filteredRules.map(rule => {
                const status = getRuleStatus(rule);
                const statusStyle = STATUS_STYLES[status];
                return (
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
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 10px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 500,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          textTransform: 'capitalize',
                        }}
                      >
                        {status}
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { RULES_QUERY } from '@/graphql/queries/rules';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RulesList } from '@/components/rule-builder/RulesList';
import { RuleBuilderSlideover } from '@/components/rule-builder/RuleBuilderSlideover';
import type { IRulesData, IRuleFromAPI } from '@/components/rule-builder/types';

export const ShippingRulesPage = () => {
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IRuleFromAPI | null>(null);
  const [statusFilter, setStatusFilter] = useState<'active' | 'expired' | 'scheduled'>('active');

  const { data, error, isLoading, mutate } = useGraphQL<IRulesData>({
    query: RULES_QUERY,
    schema: 'internal',
    variables: { first: 50 },
  });

  const rules: IRuleFromAPI[] =
    data?.rules?.edges?.map(e => e.node) || [];

  const handleNewRule = useCallback(() => {
    setEditingRule(null);
    setSlideoverOpen(true);
  }, []);

  const handleEdit = useCallback((rule: IRuleFromAPI) => {
    setEditingRule(rule);
    setSlideoverOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setSlideoverOpen(false);
    setEditingRule(null);
  }, []);

  const handleSaved = useCallback(() => {
    mutate();
  }, [mutate]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="title">Shipping Rules</Text>
        <Button variant="primary" onClick={handleNewRule}>
          New Rule
        </Button>
      </div>

      <RulesList
        rules={rules}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onEdit={handleEdit}
        onDeleted={handleSaved}
      />

      <RuleBuilderSlideover
        open={slideoverOpen}
        onClose={handleClose}
        onSaved={handleSaved}
        editingRule={editingRule}
      />
    </div>
  );
};

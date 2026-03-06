'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { RULES_QUERY } from '@/graphql/queries/rules';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { RulesList } from '@/components/rule-builder/RulesList';
import { RuleBuilderSlideover } from '@/components/rule-builder/RuleBuilderSlideover';
import type { IRulesData, IRuleFromAPI } from '@/components/rule-builder/types';

const DISCOUNT_CONTEXTS = ['DISCOUNT_CONTEXT', 'DISCOUNT_ITEM_CONTEXT'];

export const DiscountsPage = () => {
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IRuleFromAPI | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'expired' | 'scheduled'
  >('active');

  const { data, error, isLoading, mutate } = useGraphQL<IRulesData>({
    query: RULES_QUERY,
    schema: 'internal',
    variables: {
      filter: { contexts: DISCOUNT_CONTEXTS },
      first: 50,
    },
  });

  const rules: IRuleFromAPI[] = useMemo(
    () => data?.rules?.edges?.map(e => e.node) || [],
    [data],
  );

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
        <Text type="title">Discounts</Text>
        <Button variant="primary" onClick={handleNewRule}>
          New Discount
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-500)' }}>
        Create discount rules that apply to orders during Zonos Checkout.
        Discounts can be based on order totals, specific SKUs, or country
        destinations.
      </p>

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

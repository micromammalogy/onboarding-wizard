/**
 * Hook to fetch and cache rule contexts (variables/tokens per context).
 * Uses the existing useGraphQL SWR hook for caching.
 */

import { useMemo } from 'react';
import { useGraphQL } from '@/hooks/useGraphQL';
import { RULE_CONTEXTS_QUERY } from '@/graphql/queries/rules';
import type { IRuleContextsData, IRuleContext, IRuleToken } from './types';

export function useRuleContexts() {
  const { data, error, isLoading } = useGraphQL<IRuleContextsData>({
    query: RULE_CONTEXTS_QUERY,
    schema: 'internal',
  });

  const contexts: IRuleContext[] = data?.ruleContexts || [];

  /** Map of context name (e.g. "ITEM_CREATE_POST") → context object */
  const contextMap = useMemo(
    () =>
      contexts.reduce<Record<string, IRuleContext>>((acc, ctx) => {
        acc[ctx.name] = ctx;
        return acc;
      }, {}),
    [contexts],
  );

  /** Get variables for a specific context */
  const getTokensForContext = (contextName: string): IRuleToken[] => {
    return contextMap[contextName]?.variables || [];
  };

  /** Get assignable variables (for actions) for a context */
  const getAssignableTokens = (contextName: string): IRuleToken[] => {
    return getTokensForContext(contextName).filter(t => t.assignable);
  };

  /** Get all variables (for conditions) for a context */
  const getConditionTokens = (contextName: string): IRuleToken[] => {
    return getTokensForContext(contextName);
  };

  /** Build a label map (variable value → description) for a context */
  const getTokenLabels = (contextName: string): Record<string, string> => {
    const tokens = getTokensForContext(contextName);
    return tokens.reduce<Record<string, string>>((acc, t) => {
      acc[t.value] = t.description || t.value;
      return acc;
    }, {});
  };

  /** Find a variable by name within a context */
  const findToken = (
    contextName: string,
    tokenName: string,
  ): IRuleToken | undefined => {
    return getTokensForContext(contextName).find(t => t.value === tokenName);
  };

  return {
    contexts,
    contextMap,
    getTokensForContext,
    getAssignableTokens,
    getConditionTokens,
    getTokenLabels,
    findToken,
    isLoading,
    error,
  };
}

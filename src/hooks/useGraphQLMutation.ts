import { useState, useCallback } from 'react';
import { graphqlFetcher } from '@/lib/graphql/fetcher';
import { useAuthStore } from './useAuthStore';
import type { IGraphQLSchema } from '@/types/graphql';

type IUseMutationParams = {
  schema: IGraphQLSchema;
  query: string;
};

/**
 * Imperative mutation hook (non-SWR).
 * Returns an execute function + loading/error state.
 */
export function useGraphQLMutation<T = Record<string, unknown>>({
  schema,
  query,
}: IUseMutationParams) {
  const { organizationId, credentialToken, merchantToken, authCredential } = useAuthStore();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (variables?: Record<string, unknown>) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await graphqlFetcher<T>({
          schema,
          query,
          variables,
          organizationId,
          merchantToken,
          credentialToken,
          authCredential,
        });
        setData(result.data ?? null);
        return result.data ?? null;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [schema, query, organizationId, merchantToken, credentialToken],
  );

  return { execute, data, error, isLoading };
}

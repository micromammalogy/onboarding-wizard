import useSWR from 'swr';
import { graphqlFetcher } from '@/lib/graphql/fetcher';
import { useAuthStore } from './useAuthStore';
import type { IGraphQLSchema } from '@/types/graphql';

type IUseGraphQLParams = {
  schema: IGraphQLSchema;
  query: string;
  variables?: Record<string, unknown>;
  skip?: boolean;
};

/**
 * SWR-based GraphQL hook.
 * Auto-injects org context + credential from the auth store.
 * Merchant token in SWR key ensures auto-refetch on org switch.
 */
export function useGraphQL<T = Record<string, unknown>>({
  schema,
  query,
  variables,
  skip = false,
}: IUseGraphQLParams) {
  const { organizationId, isAuthenticated, credentialToken, merchantToken, authCredential } = useAuthStore();

  const key =
    !skip && isAuthenticated
      ? JSON.stringify({ schema, query, variables, organizationId, merchantToken })
      : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data?: T }>(
    key,
    async () => {
      const result = await graphqlFetcher<T>({
        schema,
        query,
        variables,
        organizationId,
        merchantToken,
        credentialToken,
        authCredential,
      });
      return result;
    },
    {
      revalidateOnFocus: false,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    },
  );

  return {
    data: data?.data ?? null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

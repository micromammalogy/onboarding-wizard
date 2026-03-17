import useSWR from 'swr';
import { useAuthStore } from './useAuthStore';

export type IOrganizationDetail = {
  id: string;
  name: string | null;
  website: string | null;
  party: {
    location: {
      line1: string | null;
      line2: string | null;
      locality: string | null;
      administrativeAreaCode: string | null;
      postalCode: string | null;
      countryCode: string | null;
    } | null;
  } | null;
};

const fetcher = (url: string) =>
  fetch(url)
    .then(r => r.json())
    .then(d => (d.organization as IOrganizationDetail | null) ?? null);

/**
 * Fetches org details via the service-token server route.
 * Uses the `organization` (singular) query scoped by org ID header.
 * SWR caches so navigating between General Settings sections is instant.
 */
export function useOrganizationDetail() {
  const { organizationId } = useAuthStore();

  const { data, isLoading } = useSWR<IOrganizationDetail | null>(
    organizationId ? `/api/organizations/${encodeURIComponent(organizationId)}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  return { org: data ?? null, isLoading };
}

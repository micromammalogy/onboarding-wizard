export const ORGANIZATION_QUERY = `
  query getOrganization {
    organization {
      id
      name
      website
      party {
        location {
          line1
          line2
          locality
          administrativeAreaCode
          postalCode
          countryCode
        }
      }
    }
  }
`;

export type IOrganizationData = {
  organization: {
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
  } | null;
};

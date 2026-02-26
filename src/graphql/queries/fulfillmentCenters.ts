export const FULFILLMENT_CENTERS_QUERY = `
  query getFulfillmentCenters {
    fulfillmentCenters {
      id
      name
      type
      party {
        id
        location {
          line1
          line2
          line3
          locality
          administrativeArea
          administrativeAreaCode
          countryCode
          postalCode
        }
        person {
          firstName
          lastName
          companyName
          email
          phone
        }
      }
    }
  }
`;

export type IFulfillmentCentersData = {
  fulfillmentCenters: {
    id: string;
    name: string;
    type: 'PRIMARY' | 'STANDARD' | 'CONSOLIDATION_CENTER';
    party: {
      id: string;
      location: {
        line1: string | null;
        line2: string | null;
        line3: string | null;
        locality: string | null;
        administrativeArea: string | null;
        administrativeAreaCode: string | null;
        countryCode: string;
        postalCode: string | null;
      } | null;
      person: {
        firstName: string | null;
        lastName: string | null;
        companyName: string | null;
        email: string | null;
        phone: string | null;
      } | null;
    };
  }[];
};

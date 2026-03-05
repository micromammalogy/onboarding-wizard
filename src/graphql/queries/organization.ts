export const ORGANIZATION_QUERY = `
  query organization {
    organization {
      id
      name
      status
      type
      party {
        id
        location {
          administrativeArea
          administrativeAreaCode
          countryCode
          line1
          line2
          line3
          locality
          postalCode
        }
        person {
          companyName
          firstName
          lastName
          email
          phone
        }
      }
    }
  }
`;

export type IOrganizationData = {
  organization: IOrganization;
};

export type IOrganization = {
  id: string;
  name: string;
  status: string;
  type: string;
  party: {
    id: string;
    location: {
      administrativeArea: string | null;
      administrativeAreaCode: string | null;
      countryCode: string;
      line1: string | null;
      line2: string | null;
      line3: string | null;
      locality: string | null;
      postalCode: string | null;
    } | null;
    person: {
      companyName: string | null;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  } | null;
};

export const ONLINE_STORE_SETTINGS_QUERY = `
  query onlineStoreSettings {
    onlineStoreSettings {
      platform
      url
    }
  }
`;

export type IOnlineStoreSettingsData = {
  onlineStoreSettings: {
    platform: string;
    url: string;
  };
};

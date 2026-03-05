export const ORGANIZATION_UPDATE = `
  mutation organizationUpdate($input: OrganizationUpdateInput!) {
    organizationUpdate(input: $input) {
      id
      name
    }
  }
`;

export const ONLINE_STORE_SETTINGS_UPDATE = `
  mutation onlineStoreSettingsUpdate($input: OnlineStoreSettingsUpdateInput!) {
    onlineStoreSettingsUpdate(input: $input) {
      platform
      url
    }
  }
`;

export const PARTY_CREATE_FOR_ORG = `
  mutation CreatePartyForOrganization($input: PartyCreateInput!) {
    partyCreate(input: $input) {
      id
    }
  }
`;

/** Mutations for organization updates */

export const ORGANIZATION_UPDATE = `
  mutation organizationUpdate($input: OrganizationUpdateInput!) {
    organizationUpdate(input: $input) {
      id
      name
    }
  }
`;

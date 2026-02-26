/** Step 1 of create/update: create a Party with location + person */
export const PARTY_CREATE = `
  mutation CreatePartyForFulfillmentCenter($input: PartyCreateInput!) {
    partyCreate(input: $input) {
      id
    }
  }
`;

/** Step 2 of create: link the new party to a fulfillment center */
export const FULFILLMENT_CENTER_CREATE = `
  mutation createFulfillmentCenter($partyId: ID!, $name: String!, $type: FulfillmentCenterType!) {
    fulfillmentCenterCreate(input: { name: $name, party: $partyId, type: $type }) {
      id
    }
  }
`;

/** Step 2 of update: update the fulfillment center with new party */
export const FULFILLMENT_CENTER_UPDATE = `
  mutation updateFulfillmentCenter($input: FulfillmentCenterUpdateInput!) {
    fulfillmentCenterUpdate(input: $input) {
      id
    }
  }
`;

/** Delete a fulfillment center */
export const FULFILLMENT_CENTER_DELETE = `
  mutation deleteFulfillmentCenter($deleteId: ID!) {
    fulfillmentCenterDelete(input: $deleteId)
  }
`;

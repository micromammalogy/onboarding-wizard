export const PACKING_SLIP_SETTINGS_UPDATE = `
  mutation setPackingSlipSettings($input: PackingSlipSettingsUpdateInput!) {
    packingSlipSettingsUpdate(input: $input) {
      id
    }
  }
`;

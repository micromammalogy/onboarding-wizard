export const UPDATE_LANDED_COST_SETTINGS = `
  mutation updateLandedCostSettings($input: UpdateLandedCostSettingsInput!) {
    updateLandedCostSettings(input: $input) {
      defaultNativeCurrency
    }
  }
`;

export const LANDED_COST_SETTINGS_QUERY = `
  query landedCostSettings {
    landedCostSettings {
      defaultNativeCurrency
    }
  }
`;

export type ILandedCostSettingsData = {
  landedCostSettings: {
    defaultNativeCurrency: string | null;
  };
};

export const LANDED_COST_SETTINGS_QUERY = `
  query landedCostSettings {
    landedCostSettings {
      defaultNativeCurrency
      defaultCountryOfOrigin
      defaultHarmonizedCode
      defaultCustomsDescription
      landedCostGuarantee
    }
  }
`;

export type ILandedCostSettingsData = {
  landedCostSettings: {
    defaultNativeCurrency: string | null;
    defaultCountryOfOrigin: string | null;
    defaultHarmonizedCode: string | null;
    defaultCustomsDescription: string | null;
    landedCostGuarantee: string | null;
  };
};

export const APPEARANCE_SETTINGS_UPDATE = `
  mutation updateAppearanceSettings($input: AppearanceSettingsUpdateInput!) {
    appearanceSettingsUpdate(input: $input) {
      id
      colorPrimary
      colorSecondary
      fontFamily
      logoUrl
      style
      theme
      zonosAttribution
    }
  }
`;

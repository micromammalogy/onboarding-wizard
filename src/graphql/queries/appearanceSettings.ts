export const APPEARANCE_SETTINGS_QUERY = `
  query appearanceSettings {
    appearanceSettings {
      colorPrimary
      colorSecondary
      fontFamily
      logoUrl
      style
      theme
      zonosAttribution
      id
    }
  }
`;

export type IAppearanceSettings = {
  colorPrimary: string;
  colorSecondary: string;
  fontFamily: string;
  logoUrl: string;
  style: 'ROUNDED' | 'SHARP';
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  zonosAttribution: 'ENABLED' | 'DISABLED';
  id: string;
};

export type IAppearanceSettingsData = {
  appearanceSettings: IAppearanceSettings;
};

export const CLASSIFY_SETTINGS_QUERY = `
  query classifySettings {
    itemSetting {
      id
      classifyMissingHsCodes
      minimumConfidenceThreshold
    }
    classificationSetting {
      id
      marketProfile
    }
  }
`;

export type IClassifySettingsData = {
  itemSetting: {
    id: string;
    classifyMissingHsCodes: 'ENABLED' | 'DISABLED';
    minimumConfidenceThreshold: number;
  };
  classificationSetting: {
    id: string;
    marketProfile: string | null;
  };
};

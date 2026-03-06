export const CLASSIFY_SETTINGS_UPDATE = `
  mutation classifySettingsUpdate(
    $inputItemSettings: ItemSettingUpdateInput!
    $inputClassificationSettings: ClassificationSettingUpdateInput!
  ) {
    itemSettingUpdate(input: $inputItemSettings) {
      id
      classifyMissingHsCodes
      minimumConfidenceThreshold
    }
    classificationSettingUpdate(input: $inputClassificationSettings) {
      id
      marketProfile
    }
  }
`;

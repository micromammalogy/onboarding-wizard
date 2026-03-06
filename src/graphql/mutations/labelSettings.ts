export const LABEL_SETTINGS_UPDATE = `
  mutation setLabelSettings($input: LabelSettingsUpdateInput!) {
    labelSettingsUpdate(input: $input) {
      id
    }
  }
`;

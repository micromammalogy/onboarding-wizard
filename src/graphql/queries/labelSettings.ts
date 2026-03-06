export const LABEL_SETTINGS_QUERY = `
  query getLabelSettings {
    labelSettings {
      descriptionOverride {
        overrideValue
        scope
      }
      id
      labelFileType
      labelSize
      serviceLevel {
        id
      }
      signatureRequired
      shippingPayment
    }
  }
`;

export type ILabelSettings = {
  descriptionOverride: {
    overrideValue: string;
    scope: string;
  } | null;
  id: string;
  labelFileType: 'PDF' | 'PNG' | 'ZPL';
  labelSize: 'FOUR_BY_SIX' | 'EIGHT_BY_ELEVEN';
  serviceLevel: { id: string } | null;
  signatureRequired: boolean;
  shippingPayment: 'SENDER' | 'THIRD_PARTY' | null;
};

export type ILabelSettingsData = {
  labelSettings: ILabelSettings;
};

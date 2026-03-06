export const PACKING_SLIP_SETTINGS_QUERY = `
  query getPackingSlipSettings {
    packingSlipSettings {
      customNotes
      footerText
      headerText
      id
      includeBarcodeOrderId
      includeBarcodeShipmentId
      includeBarcodeTracking
      pageSize
      showItemImages
      showItemPrices
      showOrderTotal
    }
  }
`;

export type IPackingSlipSettings = {
  customNotes: string;
  footerText: string;
  headerText: string;
  id: string;
  includeBarcodeOrderId: boolean;
  includeBarcodeShipmentId: boolean;
  includeBarcodeTracking: boolean;
  pageSize: 'FOUR_BY_SIX' | 'EIGHT_BY_ELEVEN';
  showItemImages: boolean;
  showItemPrices: boolean;
  showOrderTotal: boolean;
};

export type IPackingSlipSettingsData = {
  packingSlipSettings: IPackingSlipSettings;
};

export const TAX_IDS_QUERY = `
  query taxIdsList($filter: TaxIdFilterInput) {
    taxIds(filter: $filter) {
      administrativeAreaCode
      allowLowValueOrders
      countryCode
      effectiveAt
      expiresAt
      id
      method
      mode
      organization
      sendEmails
      taxIdNumber
      type
    }
  }
`;

export type ITaxId = {
  administrativeAreaCode: string | null;
  allowLowValueOrders: boolean;
  countryCode: string;
  effectiveAt: string | null;
  expiresAt: string | null;
  id: string;
  method: string;
  mode: string;
  organization: string;
  sendEmails: boolean;
  taxIdNumber: string;
  type: string;
};

export type ITaxIdsData = {
  taxIds: ITaxId[];
};

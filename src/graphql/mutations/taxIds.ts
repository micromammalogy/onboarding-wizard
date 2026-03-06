export const TAX_ID_CREATE = `
  mutation taxIdsCreate($input: TaxIdInput) {
    taxIdCreate(input: $input) {
      id
      taxIdNumber
      countryCode
      type
    }
  }
`;

export const TAX_ID_DELETE = `
  mutation taxIdsDelete($id: ID!) {
    taxIdDelete(id: $id)
  }
`;

export const TAX_ID_UPDATE = `
  mutation taxIdsUpdate($input: TaxIdUpdateInput) {
    taxIdUpdate(input: $input) {
      id
      taxIdNumber
      countryCode
      type
    }
  }
`;

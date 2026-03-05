export const PACKAGING_OPTION_CREATE = `
  mutation createPackagingOption($input: [PackagingOptionCreateInput!]!) {
    packagingOptionCreate(input: $input) {
      id
      name
      length
      width
      height
      dimensionalUnit
      packageWeight
      weightCapacity
      weightUnit
      type
      source
      status
    }
  }
`;

export const PACKAGING_OPTION_DELETE = `
  mutation deletePackagingOption($input: ID) {
    packagingOptionDelete(input: $input)
  }
`;

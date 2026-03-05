export const BILLING_ACCOUNT_UPDATE = `
  mutation updateBillingAccount($input: BillingAccountUpdateInput!) {
    billingAccountUpdate(input: $input) {
      accountId
    }
  }
`;

export const BILLING_COMPANY_UPDATE = `
  mutation billingCompanyUpdate($input: BillingCompanyUpdateInput!) {
    billingCompanyUpdate(input: $input) {
      id
    }
  }
`;

export const BILLING_ACCOUNT_QUERY = `
  query getBillingAccount {
    billingAccount {
      accountId
      companyName
      email
      phone
      address {
        administrativeArea
        countryCode
        line1
        line2
        locality
        postalCode
      }
    }
  }
`;

export type IBillingAccountData = {
  billingAccount: {
    accountId: string | null;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    address: {
      administrativeArea: string | null;
      countryCode: string | null;
      line1: string | null;
      line2: string | null;
      locality: string | null;
      postalCode: string | null;
    } | null;
  } | null;
};

export const BILLING_COMPANY_QUERY = `
  query billingCompany($organizationId: String!) {
    billingCompany(input: { organizationId: $organizationId }) {
      id
      name
      email
      currency
      accountStanding
    }
  }
`;

export type IBillingCompanyData = {
  billingCompany: {
    id: string;
    name: string | null;
    email: string | null;
    currency: string | null;
    accountStanding: string | null;
  } | null;
};

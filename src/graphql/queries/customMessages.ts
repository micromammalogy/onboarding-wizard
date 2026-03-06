export const CUSTOM_MESSAGES_QUERY = `
  query localeCountryMessages(
    $storeId: Int!
    $localeTo: String!
    $pageNames: [locale_pageName_enum!]!
    $limit: Int!
    $offset: Int!
  ) {
    locale_countryCodesPage_aggregate(
      where: {
        storeId: { _eq: $storeId }
        pageName: { _in: $pageNames }
      }
      limit: $limit
      offset: $offset
      order_by: { createdAt: desc }
    ) {
      aggregate {
        count
      }
      nodes {
        countryCodesPageMessageLinks {
          message {
            textFrom
            textTo
            localeFrom
            localeTo
            id
          }
          id
        }
        countryCodes
        createdAt
        pageName
        updatedAt
        id
      }
    }
  }
`;

export type ICustomMessageNode = {
  id: string;
  countryCodes: string[];
  pageName: string;
  createdAt: string;
  updatedAt: string;
  countryCodesPageMessageLinks: {
    id: string;
    message: {
      id: string;
      textFrom: string;
      textTo: string;
      localeFrom: string;
      localeTo: string;
    };
  }[];
};

export type ICustomMessagesData = {
  locale_countryCodesPage_aggregate: {
    aggregate: { count: number };
    nodes: ICustomMessageNode[];
  };
};

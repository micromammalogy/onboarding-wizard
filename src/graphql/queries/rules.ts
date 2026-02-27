/** Queries for the rule builder */

export const RULE_CONTEXTS_QUERY = `
  query getRuleContexts {
    ruleContexts {
      name
      context
      service
      variables {
        value
        description
        ruleTokenType
        assignable
      }
    }
  }
`;

export const RULES_QUERY = `
  query getRules($filter: RulesFilter, $first: Int, $after: String) {
    rules(filter: $filter, first: $first, after: $after) {
      edges {
        node {
          id
          name
          description
          context
          condition
          actions
          startsAt
          endsAt
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

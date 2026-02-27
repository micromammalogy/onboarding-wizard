/** Mutations for the rule builder */

export const RULE_VALIDATE = `
  mutation validateRule($input: RuleValidateInput!) {
    ruleValidate(input: $input)
  }
`;

export const RULE_CREATE = `
  mutation createRule($input: RuleCreateInput!) {
    ruleCreate(input: $input) {
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
`;

export const RULE_UPDATE = `
  mutation updateRule($input: RuleUpdateInput!) {
    ruleUpdate(input: $input) {
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
`;

export const RULE_ARCHIVE = `
  mutation archiveRule($id: ID!) {
    ruleArchive(id: $id)
  }
`;

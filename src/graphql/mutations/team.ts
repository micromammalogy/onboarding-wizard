export const INVITE_USERS = `
  mutation inviteUsers($accessLevel: AccessLevel!, $emails: [String!]!) {
    inviteUsers(accessLevel: $accessLevel, emails: $emails) {
      email
      success
      message
    }
  }
`;

export const USER_ACCESS_LEVEL_UPDATE = `
  mutation userAccessLevelUpdate($accessLevel: AccessLevel!, $userId: ID!) {
    userAccessLevelUpdate(accessLevel: $accessLevel, userId: $userId)
  }
`;

export const DISABLE_USER = `
  mutation disableUser($userId: ID!) {
    disableUser(userId: $userId)
  }
`;

export const REACTIVATE_USER = `
  mutation reactivateUser($userId: ID!) {
    reactivateUser(userId: $userId)
  }
`;

export const USER_ARCHIVE = `
  mutation userArchive($userId: ID!) {
    userArchive(input: { userId: $userId })
  }
`;

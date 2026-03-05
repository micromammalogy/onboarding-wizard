export const TEAM_USERS_QUERY = `
  query users($first: Int!, $filter: UserFilter) {
    users(first: $first, filter: $filter) {
      edges {
        node {
          accessLevel
          id
          name
          email
          organizations
          status
        }
      }
    }
  }
`;

export type ITeamUser = {
  accessLevel: 'ADMIN' | 'MEMBER' | 'NONE' | 'CUSTOM';
  id: string;
  name: string | null;
  email: string;
  organizations: string[];
  status: 'ACTIVE' | 'DISABLED' | 'INVITATION_PENDING';
};

export type ITeamUsersData = {
  users: {
    edges: {
      node: ITeamUser;
    }[];
  };
};

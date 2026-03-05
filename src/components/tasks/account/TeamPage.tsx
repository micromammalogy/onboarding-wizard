'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  TEAM_USERS_QUERY,
  type ITeamUsersData,
  type ITeamUser,
} from '@/graphql/queries/team';
import {
  INVITE_USERS,
  USER_ACCESS_LEVEL_UPDATE,
  DISABLE_USER,
  REACTIVATE_USER,
  USER_ARCHIVE,
} from '@/graphql/mutations/team';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN', label: 'Admin' },
];

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE: { bg: 'var(--amino-green-50)', color: 'var(--amino-green-700)', label: 'Active' },
  DISABLED: { bg: 'var(--amino-gray-100)', color: 'var(--amino-gray-500)', label: 'Disabled' },
  INVITATION_PENDING: { bg: 'var(--amino-yellow-50)', color: 'var(--amino-yellow-700)', label: 'Pending' },
};

export const TeamPage = () => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, error, isLoading, mutate } = useGraphQL<ITeamUsersData>({
    query: TEAM_USERS_QUERY,
    schema: 'auth',
    variables: { first: 100, filter: {} },
  });

  const { execute: inviteUsers } = useGraphQLMutation({
    query: INVITE_USERS,
    schema: 'auth',
  });
  const { execute: updateAccessLevel } = useGraphQLMutation({
    query: USER_ACCESS_LEVEL_UPDATE,
    schema: 'auth',
  });
  const { execute: disableUser } = useGraphQLMutation({
    query: DISABLE_USER,
    schema: 'auth',
  });
  const { execute: reactivateUser } = useGraphQLMutation({
    query: REACTIVATE_USER,
    schema: 'auth',
  });
  const { execute: archiveUser } = useGraphQLMutation({
    query: USER_ARCHIVE,
    schema: 'auth',
  });

  const users: ITeamUser[] = data?.users?.edges?.map(e => e.node) || [];

  const filteredUsers = searchQuery.trim()
    ? users.filter(u =>
        (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      setInviteError('Email is required.');
      return;
    }
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      await inviteUsers({
        accessLevel: inviteRole,
        emails: [inviteEmail.trim()],
      });
      mutate();
      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail('');
      setTimeout(() => { setInviteSuccess(''); setShowInvite(false); }, 2000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : String(err));
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      await updateAccessLevel({ accessLevel: newRole, userId });
      mutate();
    } catch {
      // silently fail, user can retry
    }
  };

  const handleDisable = async (user: ITeamUser) => {
    if (!confirm(`Deactivate ${user.name || user.email}? They will lose access across all stores.`)) return;
    try {
      await disableUser({ userId: user.id });
      mutate();
    } catch {
      // silently fail
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await reactivateUser({ userId });
      mutate();
    } catch {
      // silently fail
    }
  };

  const handleRemove = async (user: ITeamUser) => {
    if (!confirm(`Remove ${user.name || user.email} from this organization? They must be re-invited to regain access.`)) return;
    try {
      await archiveUser({ userId: user.id });
      mutate();
    } catch {
      // silently fail
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
      <Text type="title">Team</Text>

      <div
        style={{
          padding: 24,
          background: 'white',
          borderRadius: 8,
          border: '1px solid var(--amino-gray-200)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Team members</p>
          <p style={{ fontSize: 13, color: 'var(--amino-gray-500)', margin: '4px 0 0' }}>
            Manage who has access to this store.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ flex: 1, maxWidth: 240 }}>
            <Input
              label=""
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Find members..."
            />
          </div>
          <Button variant="primary" onClick={() => setShowInvite(true)}>
            Invite members
          </Button>
        </div>

        {/* Invite form */}
        {showInvite && (
          <div
            style={{
              padding: 16,
              background: 'var(--amino-gray-50)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 12 }}>
              <Input
                label="Email"
                type="email"
                value={inviteEmail}
                onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }}
                placeholder="user@example.com"
              />
              <Select
                label="Role"
                value={ROLE_OPTIONS.find(o => o.value === inviteRole) || null}
                onChange={option => {
                  if (option) setInviteRole(option.value as 'ADMIN' | 'MEMBER');
                }}
                options={ROLE_OPTIONS}
              />
            </div>
            {inviteError && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>{inviteError}</p>}
            {inviteSuccess && <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-green-600)' }}>{inviteSuccess}</p>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="subtle" onClick={() => { setShowInvite(false); setInviteError(''); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleInvite} loading={inviting}>
                Send Invite
              </Button>
            </div>
          </div>
        )}

        {/* Members table */}
        {filteredUsers.length > 0 ? (
          <div
            style={{
              borderRadius: 8,
              border: '1px solid var(--amino-gray-200)',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--amino-gray-200)' }}>
                  {['Member', 'Role', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '10px 16px',
                        fontSize: 12,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        color: 'var(--amino-gray-500)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const statusInfo = STATUS_STYLES[user.status] || STATUS_STYLES.ACTIVE;
                  const isDisabled = user.status === 'DISABLED';
                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--amino-gray-100)',
                        opacity: isDisabled ? 0.6 : 1,
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>
                          {user.name || 'No name'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--amino-gray-400)' }}>
                          {user.email}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>
                        {isDisabled ? (
                          <span style={{ color: 'var(--amino-gray-400)' }}>
                            {user.accessLevel === 'ADMIN' ? 'Admin' : 'Member'}
                          </span>
                        ) : (
                          <select
                            value={user.accessLevel}
                            onChange={e => handleRoleChange(user.id, e.target.value as 'ADMIN' | 'MEMBER')}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 6,
                              border: '1px solid var(--amino-gray-200)',
                              fontSize: 13,
                              background: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="MEMBER">Member</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 12,
                            fontWeight: 500,
                            background: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {isDisabled ? (
                            <Button size="sm" variant="subtle" onClick={() => handleReactivate(user.id)}>
                              Reactivate
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="subtle" onClick={() => handleDisable(user)}>
                                Deactivate
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => handleRemove(user)}>
                                Remove
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-400)', textAlign: 'center', padding: 24 }}>
            {searchQuery ? 'No members match your search.' : 'No team members found.'}
          </p>
        )}
      </div>
    </div>
  );
};

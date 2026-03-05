'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';

type IAuthGateProps = {
  children: ReactNode;
};

/**
 * Two-step auth gate:
 * Step 1: Enter credential token (persisted)
 * Step 2: Org search → click to select → fetch merchant token → done
 */
export const AuthGate = ({ children }: IAuthGateProps) => {
  const { credentialToken, organizationId, merchantToken } = useAuthStore();
  const [step, setStep] = useState<'token' | 'org-search'>(
    credentialToken ? 'org-search' : 'token',
  );
  const [tokenInput, setTokenInput] = useState('');
  const [orgSearch, setOrgSearch] = useState('');
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; references?: { storeId: number; companyId: number } }[]
  >([]);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  // Gate: authenticated when we have token, org, and merchant token
  if (credentialToken && organizationId && merchantToken) {
    return <>{children}</>;
  }

  // If we have a token but no org, jump to org search
  if (credentialToken && !organizationId && step === 'token') {
    setStep('org-search');
  }

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    useAuthStore.getState().setCredentialToken(tokenInput.trim());
    setStep('org-search');
    setError('');
  };

  const handleSearch = async (query: string) => {
    setOrgSearch(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `/api/organizations/search?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setSearchResults(data.organizations || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleConnect = async (orgId: string, orgName: string, storeId?: number) => {
    setConnecting(orgId);
    setError('');

    try {
      const res = await fetch('/api/auth/merchant-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: orgId }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to connect to merchant');
        setConnecting(null);
        return;
      }

      const store = useAuthStore.getState();
      store.setOrganization({ organizationId: orgId, organizationName: orgName });
      store.setMerchantToken(data.merchantToken);
      store.setAuthenticated();

      // Fire-and-forget: get org-scoped auth credential for the auth schema (team, etc.)
      fetch('/api/auth/login-external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          credentialToken: store.credentialToken,
          storeId,
        }),
      })
        .then(r => r.json())
        .then(authData => {
          if (authData.credential) {
            store.setAuthCredential(authData.credential);
          }
        })
        .catch(() => {});
    } catch {
      setError('Failed to connect. Please try again.');
      setConnecting(null);
    }
  };

  const cardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--amino-gray-50)',
    fontFamily: 'var(--amino-font-sans)',
  };

  const boxStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 12,
    padding: 32,
    width: 400,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  // Step 1: Credential token
  if (step === 'token') {
    return (
      <div style={cardStyle}>
        <div style={boxStyle}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
            Enter Credential Token
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--amino-gray-500)',
            }}
          >
            Paste your Zonos credential token to get started.
          </p>

          <form
            onSubmit={handleTokenSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              Credential Token
              <input
                type="password"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="credential_live_..."
                autoFocus
                required
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--amino-gray-300)',
                  borderRadius: 6,
                  fontSize: 14,
                  fontFamily: 'monospace',
                }}
              />
            </label>

            {error && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--amino-red-600)',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                padding: '10px 16px',
                background: 'var(--amino-blue-600)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Org search
  return (
    <div style={cardStyle}>
      <div style={boxStyle}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          Select Merchant
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'var(--amino-gray-500)',
          }}
        >
          Search for a merchant by name or store number.
        </p>

        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          Search merchants
          <input
            type="text"
            value={orgSearch}
            onChange={e => handleSearch(e.target.value)}
            placeholder="e.g. Zonos or 5782"
            autoFocus
            style={{
              padding: '8px 12px',
              border: '1px solid var(--amino-gray-300)',
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </label>

        {error && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--amino-red-600)',
            }}
          >
            {error}
          </p>
        )}

        {searching && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--amino-gray-400)',
            }}
          >
            Searching...
          </p>
        )}

        {searchResults.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {searchResults.map(org => {
              const isConnecting = connecting === org.id;
              return (
                <button
                  key={org.id}
                  onClick={() => handleConnect(org.id, org.name, org.references?.storeId)}
                  disabled={!!connecting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    background: isConnecting
                      ? 'var(--amino-blue-50)'
                      : 'var(--amino-gray-50)',
                    border: `1px solid ${isConnecting ? 'var(--amino-blue-400)' : 'var(--amino-gray-200)'}`,
                    borderRadius: 8,
                    cursor: connecting ? 'default' : 'pointer',
                    textAlign: 'left',
                    fontSize: 14,
                    transition: 'border-color 0.1s',
                    opacity: connecting && !isConnecting ? 0.5 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!connecting) {
                      e.currentTarget.style.borderColor = 'var(--amino-blue-400)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isConnecting) {
                      e.currentTarget.style.borderColor = 'var(--amino-gray-200)';
                    }
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: getAvatarColor(org.id),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {(org.name || org.id).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>
                      {isConnecting
                        ? 'Connecting...'
                        : org.name || `Organization ${org.id}`}
                    </div>
                    {org.references?.storeId && !isConnecting && (
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--amino-gray-400)',
                        }}
                      >
                        #{org.references.storeId}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!searching &&
          orgSearch.trim() &&
          searchResults.length === 0 && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: 'var(--amino-gray-400)',
              }}
            >
              No merchants found
            </p>
          )}

        <button
          onClick={() => {
            useAuthStore.getState().setCredentialToken('');
            setStep('token');
            setError('');
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: 'var(--amino-blue-600)',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
          }}
        >
          Change token
        </button>
      </div>
    </div>
  );
};

function getAvatarColor(id: string): string {
  const colors = [
    '#f97316',
    '#10b981',
    '#6366f1',
    '#ec4899',
    '#8b5cf6',
    '#14b8a6',
    '#f59e0b',
    '#ef4444',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUpIcon } from '@zonos/amino/icons/ChevronUpIcon';
import { ChevronDownIcon } from '@zonos/amino/icons/ChevronDownIcon';
import { SearchIcon } from '@zonos/amino/icons/SearchIcon';
import { useAuthStore } from '@/hooks/useAuthStore';
import styles from './WizardSidebar.module.scss';

type IOrganization = {
  id: string;
  name: string;
  status: string;
  references: { companyId: string; storeId: number };
};

export const OrgSwitcher = () => {
  const { organizationId, organizationName, setOrganization, setMerchantToken, setAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<IOrganization[]>([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setResults([]);
        setHighlightedIndex(-1);
        setSwitchError('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-org-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const searchOrgs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/organizations/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.organizations || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSwitchError('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => searchOrgs(value), 200);
  };

  const handleSelectOrg = async (org: IOrganization) => {
    if (switching) return;
    setSwitching(org.id);
    setSwitchError('');

    try {
      const res = await fetch('/api/auth/merchant-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: org.id }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setSwitchError(data.error || 'Failed to switch merchant');
        setSwitching(null);
        return;
      }

      setOrganization({ organizationId: org.id, organizationName: org.name });
      setMerchantToken(data.merchantToken);
      setAuthenticated();
      setIsOpen(false);
      setSearch('');
      setResults([]);
      setHighlightedIndex(-1);
    } catch {
      setSwitchError('Failed to switch. Please try again.');
    } finally {
      setSwitching(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : results.length - 1,
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelectOrg(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        setResults([]);
        setHighlightedIndex(-1);
        setSwitchError('');
        break;
    }
  };

  const displayName = organizationName || organizationId;
  const avatarLetter = displayName.charAt(0).toUpperCase() || '?';
  const avatarColor = getAvatarColor(organizationId);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div className={styles.orgSwitcher} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.orgAvatar} style={{ background: avatarColor }}>
          {avatarLetter}
        </div>
        <div className={styles.orgInfo}>
          <span className={styles.orgName}>{truncate(displayName, 20)}</span>
        </div>
        <div className={styles.chevronStack}>
          <ChevronUpIcon size={12} color="gray500" />
          <ChevronDownIcon size={12} color="gray500" />
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 8,
            right: 8,
            zIndex: 100,
            background: 'white',
            border: '1px solid var(--amino-gray-200)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            padding: 12,
            maxHeight: 400,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <p
            style={{
              margin: '0 0 8px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--amino-gray-900)',
            }}
          >
            Switch merchant
          </p>

          <div
            style={{
              padding: '6px 10px',
              background: 'var(--amino-blue-50)',
              borderRadius: 6,
              marginBottom: 8,
              fontSize: 12,
              color: 'var(--amino-blue-700)',
            }}
          >
            Current: {displayName}
          </div>

          {switchError && (
            <div
              style={{
                padding: '6px 10px',
                background: 'var(--amino-red-50, #fef2f2)',
                borderRadius: 6,
                marginBottom: 8,
                fontSize: 12,
                color: 'var(--amino-red-600)',
              }}
            >
              {switchError}
            </div>
          )}

          <div style={{ position: 'relative', marginBottom: 4 }}>
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                display: 'flex',
              }}
            >
              <SearchIcon size={14} color="gray400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by name or store number..."
              role="combobox"
              aria-expanded={results.length > 0}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `org-option-${highlightedIndex}`
                  : undefined
              }
              style={{
                width: '100%',
                padding: '7px 10px 7px 28px',
                border: '1px solid var(--amino-gray-300)',
                borderRadius: 6,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div
            ref={listRef}
            role="listbox"
            style={{ overflowY: 'auto', maxHeight: 240, marginTop: 4 }}
          >
            {loading && (
              <p style={{ fontSize: 12, color: 'var(--amino-gray-400)', padding: '8px 4px', margin: 0 }}>
                Searching...
              </p>
            )}

            {!loading && search.trim() && results.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--amino-gray-400)', padding: '8px 4px', margin: 0 }}>
                No organizations found
              </p>
            )}

            {results.map((org, index) => {
              const isHighlighted = index === highlightedIndex;
              const isCurrent = org.id === organizationId;
              const isSwitching = switching === org.id;

              return (
                <div
                  key={org.id}
                  id={`org-option-${index}`}
                  data-org-item
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => handleSelectOrg(org)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 8px',
                    borderRadius: 6,
                    cursor: switching ? 'default' : 'pointer',
                    transition: 'background 0.1s',
                    opacity: switching && !isSwitching ? 0.5 : 1,
                    background: isCurrent
                      ? 'var(--amino-blue-50)'
                      : isHighlighted
                        ? 'var(--amino-gray-50)'
                        : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: getAvatarColor(org.id),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {(org.name || org.id).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--amino-gray-900)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isSwitching
                        ? 'Switching...'
                        : org.name || `Organization ${org.id}`}
                    </div>
                    {org.references?.storeId && !isSwitching && (
                      <div style={{ fontSize: 11, color: 'var(--amino-gray-400)' }}>
                        #{org.references.storeId}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + '...';
}

function getAvatarColor(id: string): string {
  const colors = [
    '#f97316', '#10b981', '#6366f1', '#ec4899',
    '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

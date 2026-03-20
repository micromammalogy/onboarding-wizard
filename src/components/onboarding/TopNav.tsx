'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import { FileIcon } from '@zonos/amino/icons/FileIcon';
import { ChartIcon } from '@zonos/amino/icons/ChartIcon';
import { FolderListIcon } from '@zonos/amino/icons/FolderListIcon';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { DashboardIcon } from '@zonos/amino/icons/DashboardIcon';
import { LogoutIcon } from '@zonos/amino/icons/LogoutIcon';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { SearchButton } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { CreateProjectDialog } from './CreateProjectDialog';
import styles from './TopNav.module.scss';

type INavLink = {
  label: string;
  icon: React.ReactNode;
  viewMatch: string[];
  action: () => void;
};

function getAvatarColor(name: string): string {
  const colors = [
    '#0079CA',
    '#00A589',
    '#E83857',
    '#FFBE00',
    '#8E9EAC',
    '#6B46C1',
    '#DD6B20',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function TopNav() {
  const {
    view,
    openMyWork,
    backToList,
    openTemplates,
    openReports,
    openDataSets,
  } = useOnboardingNavStore();
  const { organizationName, logout } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const orgInitial = (organizationName || '?').charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(organizationName || 'User');

  const navLinks: INavLink[] = [
    {
      label: 'My Work',
      icon: <CheckmarkIcon size={18} />,
      viewMatch: ['my-work'],
      action: openMyWork,
    },
    {
      label: 'Library',
      icon: <FileIcon size={18} />,
      viewMatch: ['template-list', 'project-list', 'project-detail'],
      action: backToList,
    },
    {
      label: 'Reports',
      icon: <ChartIcon size={18} />,
      viewMatch: ['reports'],
      action: openReports,
    },
    {
      label: 'Data Sets',
      icon: <FolderListIcon size={18} />,
      viewMatch: ['data-sets'],
      action: openDataSets,
    },
  ];

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;

    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showUserMenu]);

  // Close user menu on Escape
  useEffect(() => {
    if (!showUserMenu) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showUserMenu]);

  const handleUserMenuToggle = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  return (
    <>
      <nav className={styles.topNav}>
        {/* Left — org logo */}
        <div className={styles.leftSection}>
          <button
            className={styles.orgLogo}
            onClick={openMyWork}
            style={{ background: avatarColor }}
            type="button"
          >
            {orgInitial}
          </button>
        </div>

        {/* Center — nav links */}
        <div className={styles.centerSection}>
          {navLinks.map(link => {
            const isActive = link.viewMatch.includes(view);
            return (
              <button
                key={link.label}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={link.action}
                type="button"
              >
                <span className={styles.navLinkIcon}>{link.icon}</span>
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right — utilities */}
        <div className={styles.rightSection}>
          <SearchButton />

          <button
            className={styles.newButton}
            onClick={() => setShowCreate(true)}
            type="button"
          >
            <PlusIcon size={16} />
            New
          </button>

          <NotificationCenter />

          <div ref={userMenuRef} className={styles.userMenuWrapper}>
            <button
              className={styles.userAvatar}
              onClick={handleUserMenuToggle}
              style={{ background: avatarColor }}
              type="button"
            >
              {orgInitial}
            </button>

            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.userDropdownHeader}>
                  <div
                    className={styles.userDropdownAvatar}
                    style={{ background: avatarColor }}
                  >
                    {orgInitial}
                  </div>
                  <div className={styles.userDropdownInfo}>
                    <span className={styles.userDropdownName}>
                      {organizationName || 'User'}
                    </span>
                    <span className={styles.userDropdownOrg}>
                      Org: {organizationName || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className={styles.userDropdownDivider} />
                <a href="/wizard" className={styles.userDropdownItem}>
                  <DashboardIcon size={16} />
                  Open Wizard
                </a>
                <button
                  className={styles.userDropdownItem}
                  onClick={logout}
                  type="button"
                >
                  <LogoutIcon size={16} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
}

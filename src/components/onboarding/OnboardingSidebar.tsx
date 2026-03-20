'use client';

import { DashboardIcon } from '@zonos/amino/icons/DashboardIcon';
import { BagIcon } from '@zonos/amino/icons/BagIcon';
import { ChartIcon } from '@zonos/amino/icons/ChartIcon';
import { CheckmarkIcon } from '@zonos/amino/icons/CheckmarkIcon';
import { FileIcon } from '@zonos/amino/icons/FileIcon';
import { FolderListIcon } from '@zonos/amino/icons/FolderListIcon';
import { ChevronLeftIcon } from '@zonos/amino/icons/ChevronLeftIcon';
import { LogoutIcon } from '@zonos/amino/icons/LogoutIcon';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useAuthStore } from '@/hooks/useAuthStore';
import { OrgSwitcher } from '@/components/wizard/OrgSwitcher';
import styles from './OnboardingSidebar.module.scss';

const activeStyle: React.CSSProperties = {
  background: 'var(--amino-blue-50)',
  color: 'var(--amino-blue-700)',
};

export function OnboardingSidebar() {
  const { view, openMyWork, backToList, openTemplates, openReports, openDataSets } = useOnboardingNavStore();
  const { organizationName, logout } = useAuthStore();

  const userInitial = (organizationName || '?').charAt(0).toUpperCase();

  return (
    <div className={styles.sidebar}>
      <OrgSwitcher />

      {view === 'project-detail' && (
        <div className={styles.backButton} onClick={backToList}>
          <ChevronLeftIcon size={14} />
          Back to projects
        </div>
      )}

      <nav className={styles.navSection}>
        <div className={styles.navGroup}>
          <div className={styles.navGroupHeader}>Onboarding</div>
          <div className={styles.navItemWrapper} onClick={openMyWork}>
            <div
              className={styles.navItem}
              style={view === 'my-work' ? activeStyle : undefined}
            >
              <CheckmarkIcon size={16} />
              My Work
            </div>
          </div>
          <div className={styles.navItemWrapper} onClick={backToList}>
            <div
              className={styles.navItem}
              style={view === 'project-list' ? activeStyle : undefined}
            >
              <BagIcon size={16} />
              Projects
            </div>
          </div>
          <div className={styles.navItemWrapper} onClick={openTemplates}>
            <div
              className={styles.navItem}
              style={view === 'template-list' ? activeStyle : undefined}
            >
              <FileIcon size={16} />
              Templates
            </div>
          </div>
          <div className={styles.navItemWrapper} onClick={openReports}>
            <div
              className={styles.navItem}
              style={view === 'reports' ? activeStyle : undefined}
            >
              <ChartIcon size={16} />
              Reports
            </div>
          </div>
          <div className={styles.navItemWrapper} onClick={openDataSets}>
            <div
              className={styles.navItem}
              style={view === 'data-sets' ? activeStyle : undefined}
            >
              <FolderListIcon size={16} />
              Data Sets
            </div>
          </div>
        </div>

        <div className={styles.navGroup}>
          <div className={styles.navGroupHeader}>Settings</div>
          <div className={styles.navItemWrapper}>
            <div className={styles.navItem}>
              <DashboardIcon size={16} />
              Wizard
              <a
                href="/wizard"
                className={styles.navLink}
                onClick={e => e.stopPropagation()}
              >
                Open
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className={styles.userFooter}>
        <div className={styles.userAvatar}>{userInitial}</div>
        <span className={styles.userName}>{organizationName || 'User'}</span>
        <button className={styles.logoutButton} onClick={logout} title="Log out">
          <LogoutIcon size={16} />
        </button>
      </div>
    </div>
  );
}

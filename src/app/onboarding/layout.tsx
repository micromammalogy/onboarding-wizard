'use client';

import { AuthGate } from '@/components/auth/AuthGate';
import { TopNav } from '@/components/onboarding/TopNav';
import { GlobalSearch } from '@/components/onboarding/GlobalSearch';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import styles from './Layout.module.scss';

/** Views that need full-width content with no padding */
const FULL_WIDTH_VIEWS = new Set(['run-view']);

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const view = useOnboardingNavStore(s => s.view);
  const noPadding = FULL_WIDTH_VIEWS.has(view);

  return (
    <AuthGate>
      <GlobalSearch />
      <div className={styles.app}>
        <TopNav />
        <main
          className={`${styles.pageContent} ${noPadding ? styles.pageContentNoPadding : ''}`}
        >
          {children}
        </main>
      </div>
    </AuthGate>
  );
}

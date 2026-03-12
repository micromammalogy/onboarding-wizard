'use client';

import { Layout } from '@zonos/amino/components/layout/Layout';
import { AuthGate } from '@/components/auth/AuthGate';
import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar';
import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import styles from './Layout.module.scss';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <Layout
        noPaddingContent
        sidebar={<OnboardingSidebar />}
        content={
          <div className={styles.content}>
            <div className={styles.headerNav}>
              <OnboardingHeader />
            </div>
            <div className={styles.bodyWrapper}>
              <div className={styles.pageWrapper}>{children}</div>
            </div>
          </div>
        }
        footer={null}
        style={
          {
            '--dashboard-layout-width': '1440px',
            '--dashboard-layout-min-width': '700px',
            '--dashboard-layout-padding': '32px',
          } as React.CSSProperties
        }
      />
    </AuthGate>
  );
}

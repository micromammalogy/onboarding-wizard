'use client';

import { Layout } from '@zonos/amino/components/layout/Layout';
import { WizardSidebar } from '@/components/wizard/WizardSidebar';
import { WizardBreadcrumbs } from '@/components/wizard/WizardBreadcrumbs';
import { AuthGate } from '@/components/auth/AuthGate';
import styles from './Layout.module.scss';

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <Layout
        noPaddingContent
        sidebar={<WizardSidebar />}
        content={
          <div className={styles.content}>
            <div className={styles.headerNav}>
              <WizardBreadcrumbs />
            </div>
            <div className={styles.bodyWrapper}>
              <div className={styles.pageWrapper}>{children}</div>
            </div>
          </div>
        }
        footer={null}
        style={{
          '--dashboard-layout-width': '1440px',
          '--dashboard-layout-min-width': '700px',
          '--dashboard-layout-padding': '32px',
        } as React.CSSProperties}
      />
    </AuthGate>
  );
}

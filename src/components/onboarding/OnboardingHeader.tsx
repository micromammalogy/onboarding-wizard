'use client';

import { useState } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { ChevronRightIcon } from '@zonos/amino/icons/ChevronRightIcon';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useProject } from '@/hooks/useSupabase';
import { CreateProjectDialog } from './CreateProjectDialog';
import styles from '../../app/onboarding/Layout.module.scss';

export function OnboardingHeader() {
  const { view, selectedProjectId, backToList } = useOnboardingNavStore();
  const { project } = useProject(
    view === 'project-detail' ? selectedProjectId : null,
  );
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      <div className={styles.headerLeft}>
        <span
          className={
            view === 'project-list'
              ? styles.headerTitle
              : styles.headerBreadcrumb
          }
          onClick={view === 'project-detail' ? backToList : undefined}
          style={
            view === 'project-detail' ? { cursor: 'pointer' } : undefined
          }
        >
          Projects
        </span>
        {view === 'project-detail' && project && (
          <>
            <ChevronRightIcon size={12} color="gray400" />
            <span className={styles.headerTitle}>
              {project.merchant_name}
            </span>
          </>
        )}
      </div>
      <div className={styles.headerRight}>
        {view === 'project-list' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowCreate(true)}
          >
            New project
          </Button>
        )}
      </div>
      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </>
  );
}

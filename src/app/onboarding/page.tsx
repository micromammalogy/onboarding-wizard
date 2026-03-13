'use client';

import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { ProjectListPage } from '@/components/onboarding/ProjectListPage';
import { ProjectDetailPage } from '@/components/onboarding/ProjectDetailPage';
import { TemplateListPage } from '@/components/onboarding/TemplateListPage';
import { ReportsPage } from '@/components/onboarding/ReportsPage';

export default function OnboardingPage() {
  const { view, selectedProjectId } = useOnboardingNavStore();

  if (view === 'project-detail' && selectedProjectId) {
    return <ProjectDetailPage projectId={selectedProjectId} />;
  }

  if (view === 'template-list') {
    return <TemplateListPage />;
  }

  if (view === 'reports') {
    return <ReportsPage />;
  }

  return <ProjectListPage />;
}

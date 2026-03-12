'use client';

import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { ProjectListPage } from '@/components/onboarding/ProjectListPage';
import { ProjectDetailPage } from '@/components/onboarding/ProjectDetailPage';
import { TemplateListPage } from '@/components/onboarding/TemplateListPage';

export default function OnboardingPage() {
  const { view, selectedProjectId } = useOnboardingNavStore();

  if (view === 'project-detail' && selectedProjectId) {
    return <ProjectDetailPage projectId={selectedProjectId} />;
  }

  if (view === 'template-list') {
    return <TemplateListPage />;
  }

  return <ProjectListPage />;
}

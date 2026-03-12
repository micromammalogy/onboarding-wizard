'use client';

import type { ReactNode } from 'react';
import { useFieldValues } from '@/hooks/useFieldValues';

type IConditionalWrapperProps = {
  id: string;
  children: ReactNode;
};

/**
 * Wraps elements that may be conditionally shown/hidden by rules.
 * Returns null if the element is not visible.
 */
export function ConditionalWrapper({ id, children }: IConditionalWrapperProps) {
  const isVisible = useFieldValues(s => s.isVisible);

  if (!isVisible(id)) {
    return null;
  }

  return <>{children}</>;
}

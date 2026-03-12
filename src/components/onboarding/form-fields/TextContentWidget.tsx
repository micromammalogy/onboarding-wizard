'use client';

import type { ITemplateWidget } from '@/types/database';
import styles from './TextContentWidget.module.scss';

type ITextContentWidgetProps = {
  widget: ITemplateWidget;
};

export function TextContentWidget({ widget }: ITextContentWidgetProps) {
  const content = (widget.metadata as { content?: string })?.content;
  if (!content) return null;

  return (
    <div
      className={styles.container}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

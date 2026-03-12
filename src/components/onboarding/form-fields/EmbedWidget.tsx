'use client';

import type { ITemplateWidget } from '@/types/database';
import styles from './EmbedWidget.module.scss';

type IEmbedWidgetProps = {
  widget: ITemplateWidget;
};

export function EmbedWidget({ widget }: IEmbedWidgetProps) {
  const meta = widget.metadata as { url?: string };
  const url = meta?.url;
  if (!url) return null;

  return (
    <div className={styles.container}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        <span className={styles.icon}>🔗</span>
        <span className={styles.url}>{url}</span>
      </a>
    </div>
  );
}

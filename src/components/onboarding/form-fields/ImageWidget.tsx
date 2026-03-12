'use client';

import type { ITemplateWidget } from '@/types/database';
import styles from './ImageWidget.module.scss';

type IImageWidgetProps = {
  widget: ITemplateWidget;
};

export function ImageWidget({ widget }: IImageWidgetProps) {
  const meta = widget.metadata as { url?: string; alt?: string };
  const url = meta?.url;
  if (!url) return null;

  return (
    <div className={styles.container}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={meta.alt || 'Task image'}
        className={styles.image}
        loading="lazy"
      />
    </div>
  );
}

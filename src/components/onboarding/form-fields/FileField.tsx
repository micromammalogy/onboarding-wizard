'use client';

import type { ITemplateWidget } from '@/types/database';
import styles from './FileField.module.scss';

type IFileFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function FileField({ widget }: IFileFieldProps) {
  return (
    <div className={styles.container}>
      {widget.label && <label className={styles.label}>{widget.label}</label>}
      <div className={styles.dropzone}>
        <span className={styles.dropzoneText}>
          Drop files here or click to upload
        </span>
        <span className={styles.dropzoneHint}>
          File uploads will be available in a future update
        </span>
      </div>
    </div>
  );
}

'use client';

import { Badge } from '@zonos/amino/components/badge/Badge';
import type { ITemplateWidget } from '@/types/database';
import styles from './SendEmailField.module.scss';

type ISendEmailFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function SendEmailField({ widget }: ISendEmailFieldProps) {
  const metadata = widget.metadata as {
    subject?: string;
    body?: string;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Badge color="purple" size="small">Email</Badge>
        <span className={styles.label}>{widget.label ?? 'Send Email'}</span>
      </div>
      {metadata.subject && (
        <div className={styles.subject}>
          <span className={styles.subjectLabel}>Subject:</span>
          <span className={styles.subjectValue}>{metadata.subject}</span>
        </div>
      )}
      {metadata.body && (
        <div
          className={styles.body}
          dangerouslySetInnerHTML={{ __html: metadata.body }}
        />
      )}
    </div>
  );
}

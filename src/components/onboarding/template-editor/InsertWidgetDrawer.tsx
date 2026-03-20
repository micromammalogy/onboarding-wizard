'use client';

import { PlusCircleIcon } from '@zonos/amino/icons/PlusCircleIcon';
import { RemoveIcon } from '@zonos/amino/icons/RemoveIcon';
import { DocsIcon } from '@zonos/amino/icons/DocsIcon';
import { ImageIcon } from '@zonos/amino/icons/ImageIcon';
import { FileIcon } from '@zonos/amino/icons/FileIcon';
import { PlayCircleIcon } from '@zonos/amino/icons/PlayCircleIcon';
import { NoteIcon } from '@zonos/amino/icons/NoteIcon';
import { MailIcon } from '@zonos/amino/icons/MailIcon';
import { ShoppingListIcon } from '@zonos/amino/icons/ShoppingListIcon';
import { CodeIcon } from '@zonos/amino/icons/CodeIcon';
import { EditIcon } from '@zonos/amino/icons/EditIcon';
import { BookIcon } from '@zonos/amino/icons/BookIcon';
import { GlobeIcon } from '@zonos/amino/icons/GlobeIcon';
import { FileUploadIcon } from '@zonos/amino/icons/FileUploadIcon';
import { CalendarIcon } from '@zonos/amino/icons/CalendarIcon';
import { CalculatorIcon } from '@zonos/amino/icons/CalculatorIcon';
import { ChevronDownCircleIcon } from '@zonos/amino/icons/ChevronDownCircleIcon';
import { CheckCircleIcon } from '@zonos/amino/icons/CheckCircleIcon';
import { UsersIcon } from '@zonos/amino/icons/UsersIcon';
import { GridIcon } from '@zonos/amino/icons/GridIcon';
import { CopyIcon } from '@zonos/amino/icons/CopyIcon';
import { EyeOffIcon } from '@zonos/amino/icons/EyeOffIcon';
import styles from './InsertWidgetDrawer.module.scss';

type IInsertWidgetDrawerProps = {
  isOpen: boolean;
  onToggle: () => void;
  onWidgetAdd: (widgetType: string) => void;
};

type IWidgetOption = {
  type: string;
  label: string;
  icon: React.ReactNode;
};

const CONTENT_WIDGETS: IWidgetOption[] = [
  { type: 'text_content', label: 'Text', icon: <DocsIcon size={16} /> },
  { type: 'image', label: 'Image', icon: <ImageIcon size={16} /> },
  { type: 'file_content', label: 'File', icon: <FileIcon size={16} /> },
  { type: 'video', label: 'Video', icon: <PlayCircleIcon size={16} /> },
  { type: 'page', label: 'Page', icon: <NoteIcon size={16} /> },
  { type: 'send_email', label: 'Send Email', icon: <MailIcon size={16} /> },
  { type: 'subtasks', label: 'Subtasks', icon: <ShoppingListIcon size={16} /> },
  { type: 'embed', label: 'Embed', icon: <CodeIcon size={16} /> },
];

const FORM_FIELD_WIDGETS: IWidgetOption[] = [
  { type: 'text', label: 'Short Text', icon: <EditIcon size={16} /> },
  { type: 'textarea', label: 'Long Text', icon: <BookIcon size={16} /> },
  { type: 'email', label: 'Email', icon: <MailIcon size={16} /> },
  { type: 'url', label: 'Website', icon: <GlobeIcon size={16} /> },
  { type: 'file', label: 'File Upload', icon: <FileUploadIcon size={16} /> },
  { type: 'date', label: 'Date', icon: <CalendarIcon size={16} /> },
  { type: 'number', label: 'Numbers', icon: <CalculatorIcon size={16} /> },
  { type: 'select', label: 'Dropdown', icon: <ChevronDownCircleIcon size={16} /> },
  { type: 'multi_choice', label: 'Multi Choice', icon: <CheckCircleIcon size={16} /> },
  { type: 'user', label: 'User', icon: <UsersIcon size={16} /> },
  { type: 'table', label: 'Table', icon: <GridIcon size={16} /> },
  { type: 'snippet', label: 'Snippet', icon: <CopyIcon size={16} /> },
  { type: 'hidden', label: 'Hidden', icon: <EyeOffIcon size={16} /> },
];

export function InsertWidgetDrawer({
  isOpen,
  onToggle,
  onWidgetAdd,
}: IInsertWidgetDrawerProps) {
  if (!isOpen) {
    return (
      <div className={styles.toggleContainer}>
        <button className={styles.toggleButton} onClick={onToggle} title="Insert widget">
          <PlusCircleIcon size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>
        <button className={styles.closeButton} onClick={onToggle} title="Close drawer">
          <RemoveIcon size={14} />
        </button>
      </div>

      <div className={styles.drawerContent}>
        {/* Content section */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Content</span>
          <div className={styles.widgetList}>
            {CONTENT_WIDGETS.map(widget => (
              <button
                key={widget.type}
                className={styles.widgetButton}
                onClick={() => onWidgetAdd(widget.type)}
              >
                <span className={styles.widgetIcon}>{widget.icon}</span>
                <span className={styles.widgetLabel}>{widget.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.divider} />

        {/* Form Fields section */}
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Form Fields</span>
          <div className={styles.widgetList}>
            {FORM_FIELD_WIDGETS.map(widget => (
              <button
                key={widget.type}
                className={styles.widgetButton}
                onClick={() => onWidgetAdd(widget.type)}
              >
                <span className={styles.widgetIcon}>{widget.icon}</span>
                <span className={styles.widgetLabel}>{widget.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

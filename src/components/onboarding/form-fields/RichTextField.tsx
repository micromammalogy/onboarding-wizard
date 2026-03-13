'use client';

import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import type { ITemplateWidget } from '@/types/database';
import styles from './RichTextField.module.scss';

type IRichTextFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

export function RichTextField({ widget, value, onChange }: IRichTextFieldProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: styles.link },
      }),
      Placeholder.configure({
        placeholder: widget.placeholder ?? 'Start typing...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange(html === '<p></p>' ? null : html);
    },
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={styles.container}>
      {widget.label && <label className={styles.label}>{widget.label}</label>}
      <div className={styles.editorWrapper}>
        <div className={styles.toolbar}>
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.toolbarButtonActive : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.toolbarButtonActive : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </button>
          <div className={styles.toolbarDivider} />
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 2 }) ? styles.toolbarButtonActive : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading"
          >
            H2
          </button>
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 3 }) ? styles.toolbarButtonActive : ''}`}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Subheading"
          >
            H3
          </button>
          <div className={styles.toolbarDivider} />
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.toolbarButtonActive : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            •
          </button>
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.toolbarButtonActive : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            1.
          </button>
          <div className={styles.toolbarDivider} />
          <button
            type="button"
            className={`${styles.toolbarButton} ${editor.isActive('link') ? styles.toolbarButtonActive : ''}`}
            onClick={addLink}
            title="Add link"
          >
            🔗
          </button>
        </div>
        <EditorContent editor={editor} className={styles.editor} />
      </div>
    </div>
  );
}

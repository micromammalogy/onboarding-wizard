'use client';

import { useState, useRef, useCallback } from 'react';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import type { ITemplateWidget } from '@/types/database';
import { useFieldValues } from '@/hooks/useFieldValues';
import styles from './FileField.module.scss';

type IFileFieldProps = {
  widget: ITemplateWidget;
  value: string | null;
  onChange: (value: string | null) => void;
};

type IUploadedFile = {
  url: string;
  name: string;
  path: string;
};

function parseFileValue(value: string | null): IUploadedFile | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as IUploadedFile;
  } catch {
    // Legacy: value is just a URL string
    if (value.startsWith('http')) {
      return { url: value, name: 'Uploaded file', path: '' };
    }
    return null;
  }
}

export function FileField({ widget, value, onChange }: IFileFieldProps) {
  const projectId = useFieldValues(s => s._projectId);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadedFile = parseFileValue(value);

  const handleUpload = useCallback(async (file: File) => {
    if (!projectId) {
      setError('No project context for upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', projectId);

      const res = await fetch('/api/db/files', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      onChange(JSON.stringify({ url: data.url, name: data.name, path: data.path }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [projectId, onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [handleUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleRemove = useCallback(async () => {
    if (uploadedFile?.path) {
      await fetch(`/api/db/files?path=${encodeURIComponent(uploadedFile.path)}`, {
        method: 'DELETE',
      });
    }
    onChange(null);
  }, [uploadedFile, onChange]);

  return (
    <div className={styles.container}>
      {widget.label && <label className={styles.label}>{widget.label}</label>}

      {uploadedFile ? (
        <div className={styles.filePreview}>
          <a
            href={uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.fileName}
          >
            {uploadedFile.name}
          </a>
          <button
            className={styles.removeButton}
            onClick={handleRemove}
            type="button"
          >
            <RemoveCircleIcon size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneDragOver : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className={styles.hiddenInput}
            onChange={handleFileSelect}
          />
          {uploading ? (
            <span className={styles.dropzoneText}>Uploading...</span>
          ) : (
            <>
              <span className={styles.dropzoneText}>
                Drop file here or click to upload
              </span>
              <span className={styles.dropzoneHint}>
                Max 50MB
              </span>
            </>
          )}
        </div>
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}

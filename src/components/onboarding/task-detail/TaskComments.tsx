'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { CommentIcon } from '@zonos/amino/icons/CommentIcon';
import styles from './TaskComments.module.scss';

// --- Types ---

export interface IComment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  avatarColor: string;
  text: string;
  createdAt: string;
}

type ITaskCommentsProps = {
  taskId: string;
};

// --- Helpers ---

const AVATAR_COLORS = [
  '#2563EB', // blue
  '#7C3AED', // purple
  '#059669', // green
  '#D97706', // amber
  '#DC2626', // red
  '#0891B2', // cyan
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatCommentTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Render basic rich text: **bold**, *italic*, and [links](url)
 */
function renderRichText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Split into segments by markdown-style patterns
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold: **text**
      parts.push(<strong key={key++}>{match[2]}</strong>);
    } else if (match[3]) {
      // Italic: *text*
      parts.push(<em key={key++}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      // Link: [text](url)
      parts.push(
        <a key={key++} href={match[5]} target="_blank" rel="noopener noreferrer">
          {match[4]}
        </a>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

// --- Mock data factory ---

function getMockComments(taskId: string): IComment[] {
  // Return some mock comments for the first task viewed; empty for others
  // This simulates per-task comment threads
  return [
    {
      id: `c1-${taskId}`,
      taskId,
      authorId: 'u1',
      authorName: 'Shawn Roah',
      authorInitial: 'S',
      avatarColor: getAvatarColor('Shawn Roah'),
      text: 'Merchant confirmed their **primary warehouse** is in Salt Lake City. We should set that as the default fulfillment location.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `c2-${taskId}`,
      taskId,
      authorId: 'u2',
      authorName: 'Alex Chen',
      authorInitial: 'A',
      avatarColor: getAvatarColor('Alex Chen'),
      text: 'Got it. I also noticed they have a *secondary location* in Ontario. Should we add that now or wait for confirmation?',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

// --- Component ---

export function TaskComments({ taskId }: ITaskCommentsProps) {
  const [commentsByTask, setCommentsByTask] = useState<
    Record<string, IComment[]>
  >({});
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevTaskId = useRef(taskId);

  // Load mock comments for a task on first view
  useEffect(() => {
    if (!commentsByTask[taskId]) {
      setCommentsByTask(prev => ({
        ...prev,
        [taskId]: getMockComments(taskId),
      }));
    }
  }, [taskId, commentsByTask]);

  // Reset input when task changes
  if (prevTaskId.current !== taskId) {
    prevTaskId.current = taskId;
    setInputValue('');
  }

  const comments = commentsByTask[taskId] ?? [];

  // Auto-expand textarea
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputValue(e.target.value);
      const el = e.target;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    },
    [],
  );

  const handlePost = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newComment: IComment = {
      id: `c-${Date.now()}`,
      taskId,
      authorId: 'current-user',
      authorName: 'You',
      authorInitial: 'Y',
      avatarColor: getAvatarColor('You'),
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    // Optimistic add
    setCommentsByTask(prev => ({
      ...prev,
      [taskId]: [...(prev[taskId] ?? []), newComment],
    }));
    setInputValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [inputValue, taskId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Cmd/Ctrl + Enter to post
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handlePost();
      }
    },
    [handlePost],
  );

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <CommentIcon size={16} className={styles.sectionIcon} />
        <span className={styles.sectionTitle}>Comments</span>
        {comments.length > 0 && (
          <span className={styles.commentCount}>({comments.length})</span>
        )}
      </div>

      {comments.length === 0 ? (
        <div className={styles.emptyState}>
          <CommentIcon size={20} />
          <span>No comments yet. Be the first to add one.</span>
        </div>
      ) : (
        <div className={styles.commentList}>
          {comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div
                className={styles.avatar}
                style={{ background: comment.avatarColor }}
              >
                {comment.authorInitial}
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>
                    {comment.authorName}
                  </span>
                  <span className={styles.commentTime}>
                    {formatCommentTime(comment.createdAt)}
                  </span>
                </div>
                <div className={styles.commentText}>
                  {renderRichText(comment.text)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.inputArea}>
        <div
          className={styles.avatar}
          style={{ background: getAvatarColor('You') }}
        >
          Y
        </div>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            rows={1}
          />
          {inputValue.trim() && (
            <div className={styles.inputActions}>
              <Button size="sm" variant="primary" onClick={handlePost}>
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

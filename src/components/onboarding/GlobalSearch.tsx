'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { create } from 'zustand';
import { SearchIcon } from '@zonos/amino/icons/SearchIcon';
import { FileIcon } from '@zonos/amino/icons/FileIcon';
import { FolderListIcon } from '@zonos/amino/icons/FolderListIcon';
import { CheckCircleIcon } from '@zonos/amino/icons/CheckCircleIcon';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';
import { useProjects } from '@/hooks/useSupabase';
import styles from './GlobalSearch.module.scss';

// --- Search open state (shared between GlobalSearch and SearchButton) ---

type ISearchOpenState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const useSearchOpenStore = create<ISearchOpenState>(set => ({
  open: false,
  setOpen: (open: boolean) => set({ open }),
  toggle: () => set(state => ({ open: !state.open })),
}));

// --- Types ---

type ISearchResultType = 'template' | 'project' | 'task';

type ISearchResult = {
  id: string;
  type: ISearchResultType;
  title: string;
  subtitle: string | null;
  meta: string | null;
  /** For tasks, the project ID to navigate to */
  projectId?: string;
};

type IRecentSearch = {
  id: string;
  type: ISearchResultType;
  title: string;
};

// --- Constants ---

const RECENT_SEARCHES_KEY = 'zonos-search-recent';
const MAX_RECENT = 5;

// --- Helpers ---

function loadRecentSearches(): IRecentSearch[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function saveRecentSearch(item: IRecentSearch) {
  const existing = loadRecentSearches();
  const filtered = existing.filter(r => r.id !== item.id);
  const updated = [item, ...filtered].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

function getBadgeClass(type: ISearchResultType): string {
  switch (type) {
    case 'template':
      return styles.badgeTemplate;
    case 'project':
      return styles.badgeProject;
    case 'task':
      return styles.badgeTask;
  }
}

function getTypeLabel(type: ISearchResultType): string {
  switch (type) {
    case 'template':
      return 'Template';
    case 'project':
      return 'Project';
    case 'task':
      return 'Task';
  }
}

function getTypeIcon(type: ISearchResultType) {
  switch (type) {
    case 'template':
      return <FileIcon size={16} />;
    case 'project':
      return <FolderListIcon size={16} />;
    case 'task':
      return <CheckCircleIcon size={16} />;
  }
}

function statusLabel(status: string): string {
  return status
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// --- Component ---

export function GlobalSearch() {
  const { open, setOpen, toggle } = useSearchOpenStore();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<IRecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { openProject, openTemplates } = useOnboardingNavStore();
  const { projects } = useProjects();

  // Load recent searches on open
  useEffect(() => {
    if (open) {
      setRecentSearches(loadRecentSearches());
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  // Global ⌘+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      // Small delay to let the portal mount
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Build search results from cached project data
  const results = useMemo<ISearchResult[]>(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const matches: ISearchResult[] = [];

    // Search projects
    for (const project of projects) {
      const merchantName = project.merchant_name?.toLowerCase() ?? '';
      const storeUrl = project.store_url?.toLowerCase() ?? '';
      const platform = project.platform?.toLowerCase() ?? '';

      if (
        merchantName.includes(normalizedQuery) ||
        storeUrl.includes(normalizedQuery) ||
        platform.includes(normalizedQuery)
      ) {
        matches.push({
          id: project.id,
          type: 'project',
          title: project.merchant_name,
          subtitle: project.platform ?? project.store_url ?? null,
          meta: statusLabel(project.status),
        });
      }
    }

    return matches;
  }, [query, projects]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<ISearchResultType, ISearchResult[]> = {
      template: [],
      project: [],
      task: [],
    };
    for (const result of results) {
      groups[result.type].push(result);
    }
    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: ISearchResult[] = [];
    if (groupedResults.template.length > 0) flat.push(...groupedResults.template);
    if (groupedResults.project.length > 0) flat.push(...groupedResults.project);
    if (groupedResults.task.length > 0) flat.push(...groupedResults.task);
    return flat;
  }, [groupedResults]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [flatResults.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const activeEl = resultsRef.current.querySelector(
      `[data-search-index="${activeIndex}"]`,
    );
    activeEl?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleSelect = useCallback(
    (result: ISearchResult) => {
      saveRecentSearch({
        id: result.id,
        type: result.type,
        title: result.title,
      });
      setOpen(false);

      switch (result.type) {
        case 'project':
          openProject(result.id);
          break;
        case 'template':
          openTemplates();
          break;
        case 'task':
          if (result.projectId) {
            openProject(result.projectId);
          }
          break;
      }
    },
    [openProject, openTemplates],
  );

  const handleRecentClick = useCallback(
    (recent: IRecentSearch) => {
      handleSelect({
        id: recent.id,
        type: recent.type,
        title: recent.title,
        subtitle: null,
        meta: null,
      });
    },
    [handleSelect],
  );

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const listLength = query ? flatResults.length : recentSearches.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev => (prev + 1) % Math.max(listLength, 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev =>
            prev <= 0 ? Math.max(listLength - 1, 0) : prev - 1,
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (query && flatResults[activeIndex]) {
            handleSelect(flatResults[activeIndex]);
          } else if (!query && recentSearches[activeIndex]) {
            handleRecentClick(recentSearches[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [
      query,
      flatResults,
      recentSearches,
      activeIndex,
      handleSelect,
      handleRecentClick,
      handleClose,
    ],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  if (!open) return null;

  const hasResults = flatResults.length > 0;
  const showRecent = !query && recentSearches.length > 0;
  const showEmpty = query.length > 0 && !hasResults;
  const showHint = !query && recentSearches.length === 0;

  let flatIndex = 0;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onKeyDown={handleKeyDown}>
        <div className={styles.inputWrapper}>
          <SearchIcon size={18} className={styles.inputIcon} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search projects, templates, tasks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.results} ref={resultsRef}>
          {showHint && (
            <div className={styles.emptyState}>Start typing to search...</div>
          )}

          {showEmpty && (
            <div className={styles.emptyState}>No results found</div>
          )}

          {showRecent && (
            <>
              <div className={styles.recentHeader}>
                <span className={styles.recentLabel}>Recent</span>
                <button
                  className={styles.clearButton}
                  onClick={handleClearRecent}
                  type="button"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((recent, i) => (
                <div
                  key={recent.id}
                  className={`${styles.resultItem} ${i === activeIndex ? styles.active : ''}`}
                  data-search-index={i}
                  onClick={() => handleRecentClick(recent)}
                >
                  <span className={styles.resultIcon}>
                    {getTypeIcon(recent.type)}
                  </span>
                  <div className={styles.resultContent}>
                    <span className={styles.resultTitle}>{recent.title}</span>
                  </div>
                  <div className={styles.resultMeta}>
                    <span className={`${styles.badge} ${getBadgeClass(recent.type)}`}>
                      {getTypeLabel(recent.type)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}

          {hasResults && (
            <>
              {(['template', 'project', 'task'] as const).map(type => {
                const group = groupedResults[type];
                if (group.length === 0) return null;

                return (
                  <div key={type}>
                    <div className={styles.groupLabel}>
                      {type === 'template'
                        ? 'Templates'
                        : type === 'project'
                          ? 'Projects'
                          : 'Tasks'}
                    </div>
                    {group.map(result => {
                      const currentIndex = flatIndex++;
                      return (
                        <div
                          key={result.id}
                          className={`${styles.resultItem} ${currentIndex === activeIndex ? styles.active : ''}`}
                          data-search-index={currentIndex}
                          onClick={() => handleSelect(result)}
                        >
                          <span className={styles.resultIcon}>
                            {getTypeIcon(result.type)}
                          </span>
                          <div className={styles.resultContent}>
                            <span className={styles.resultTitle}>
                              {result.title}
                            </span>
                            {result.subtitle && (
                              <span className={styles.resultSubtitle}>
                                {result.subtitle}
                              </span>
                            )}
                          </div>
                          <div className={styles.resultMeta}>
                            {result.meta && (
                              <span
                                className={`${styles.badge} ${getBadgeClass(result.type)}`}
                              >
                                {result.meta}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.footerHint}>
            <span className={styles.footerKey}>↑</span>
            <span className={styles.footerKey}>↓</span>
            navigate
          </span>
          <span className={styles.footerHint}>
            <span className={styles.footerKey}>↵</span>
            select
          </span>
          <span className={styles.footerHint}>
            <span className={styles.footerKey}>esc</span>
            close
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/** Header search button that opens the global search modal */
export function SearchButton() {
  const setOpen = useSearchOpenStore(s => s.setOpen);

  return (
    <button
      className={styles.searchButton}
      onClick={() => setOpen(true)}
      type="button"
    >
      <SearchIcon size={16} className={styles.searchButtonIcon} />
      <span className={styles.searchButtonText}>Search</span>
      <span className={styles.searchButtonShortcut}>⌘K</span>
    </button>
  );
}

'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Dialog } from '@zonos/amino/components/dialog/Dialog';
import { Select } from '@zonos/amino/components/select/Select';
import { MenuButton } from '@zonos/amino/components/button/MenuButton';
import { Menu } from '@zonos/amino/components/menu/Menu';
import { MenuItem } from '@zonos/amino/components/menu/MenuItem';
import { SearchIcon } from '@zonos/amino/icons/SearchIcon';
import { FolderListIcon } from '@zonos/amino/icons/FolderListIcon';
import { ChevronRightIcon } from '@zonos/amino/icons/ChevronRightIcon';
import { PlusIcon } from '@zonos/amino/icons/PlusIcon';
import { EditIcon } from '@zonos/amino/icons/EditIcon';
import { CopyIcon } from '@zonos/amino/icons/CopyIcon';
import { TrashCanIcon } from '@zonos/amino/icons/TrashCanIcon';
import { FileIcon } from '@zonos/amino/icons/FileIcon';
import { DocsIcon } from '@zonos/amino/icons/DocsIcon';
import type { ITemplate, ITemplateTask, ITemplateWidget, ITemplateRule } from '@/types/database';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TemplateEditorPage } from './template-editor/TemplateEditorPage';
import styles from './TemplateListPage.module.scss';

// ============================================================
// Types
// ============================================================

type ITemplateWithMeta = ITemplate & {
  template_tasks: Array<{ count: number }>;
};

type IFolder = {
  id: string;
  name: string;
  parentId: string | null;
};

type IFolderNode = IFolder & {
  children: IFolderNode[];
};

type ISortOption = 'name' | 'updated_at' | 'run_count';

// ============================================================
// Mock Data — Folder tree (local state until backend is ready)
// ============================================================

const INITIAL_FOLDERS: IFolder[] = [
  { id: 'folder-1', name: 'Ecommerce Onboarding', parentId: null },
  { id: 'folder-1a', name: 'Shopify', parentId: 'folder-1' },
  { id: 'folder-1b', name: 'BigCommerce', parentId: 'folder-1' },
  { id: 'folder-2', name: 'API Integrations', parentId: null },
  { id: 'folder-3', name: 'Custom', parentId: null },
];

// Template→folder assignments (local state)
// Keys: template ID, values: folder ID
type ITemplateFolderMap = Record<string, string>;

// ============================================================
// Helpers
// ============================================================

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const json = await res.json();
  return json.data;
}

function buildFolderTree(folders: IFolder[]): IFolderNode[] {
  const map = new Map<string, IFolderNode>();
  for (const f of folders) {
    map.set(f.id, { ...f, children: [] });
  }
  const roots: IFolderNode[] = [];
  for (const node of map.values()) {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function generateId(): string {
  return `folder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTaskCount(template: ITemplateWithMeta): number {
  if (template.template_tasks && template.template_tasks.length > 0) {
    const first = template.template_tasks[0];
    if (typeof first === 'object' && 'count' in first) {
      return first.count;
    }
    return template.template_tasks.length;
  }
  return 0;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================================
// Folder Tree Node
// ============================================================

function FolderTreeNode({
  node,
  selectedFolderId,
  expandedIds,
  templateCountByFolder,
  onSelect,
  onToggle,
  onRename,
  onDelete,
}: {
  node: IFolderNode;
  selectedFolderId: string | null;
  expandedIds: Set<string>;
  templateCountByFolder: Record<string, number>;
  onSelect: (id: string | null) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isExpanded = expandedIds.has(node.id);
  const isActive = selectedFolderId === node.id;
  const hasChildren = node.children.length > 0;
  const count = templateCountByFolder[node.id] ?? 0;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = () => {
    setEditName(node.name);
    setEditing(true);
  };

  const handleRenameSubmit = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== node.name) {
      onRename(node.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <div>
      <div
        className={`${styles.folderItem} ${isActive ? styles.folderItemActive : ''}`}
        onClick={() => onSelect(node.id)}
        onDoubleClick={handleDoubleClick}
      >
        {hasChildren ? (
          <button
            className={`${styles.folderChevron} ${isExpanded ? styles.folderChevronExpanded : ''}`}
            onClick={e => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            <ChevronRightIcon size={12} />
          </button>
        ) : (
          <span className={styles.folderChevronPlaceholder} />
        )}
        <span className={styles.folderIcon}>
          <FolderListIcon size={16} />
        </span>
        {editing ? (
          <input
            ref={inputRef}
            className={styles.folderNameInput}
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setEditing(false);
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={styles.folderName}>{node.name}</span>
        )}
        {!editing && count > 0 && (
          <span className={styles.folderCount}>{count}</span>
        )}
        {!editing && (
          <span className={styles.folderActions}>
            <button
              className={styles.folderActionBtn}
              onClick={e => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              title="Delete folder"
            >
              <TrashCanIcon size={12} />
            </button>
          </span>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className={styles.folderChildren}>
          {node.children.map(child => (
            <FolderTreeNode
              key={child.id}
              node={child}
              selectedFolderId={selectedFolderId}
              expandedIds={expandedIds}
              templateCountByFolder={templateCountByFolder}
              onSelect={onSelect}
              onToggle={onToggle}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TemplateListPage (Library View)
// ============================================================

export function TemplateListPage() {
  // --- Data fetching ---
  const { data: templates, error, isLoading, mutate } = useSWR<ITemplateWithMeta[]>(
    '/api/db/templates?include_inactive=true',
    () => fetcher<ITemplateWithMeta[]>('/api/db/templates?include_inactive=true'),
    { revalidateOnFocus: false },
  );

  // --- Editor state ---
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- Folder state (local) ---
  const [folders, setFolders] = useState<IFolder[]>(INITIAL_FOLDERS);
  const [templateFolderMap, setTemplateFolderMap] = useState<ITemplateFolderMap>({});
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set(['folder-1']));

  // --- Search / sort ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ISortOption>('updated_at');

  // --- Dialogs ---
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [moveTemplateId, setMoveTemplateId] = useState<string | null>(null);
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<string | null>(null);

  // --- Computed ---
  const folderTree = useMemo(() => buildFolderTree(folders), [folders]);

  const templateCountByFolder = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const folderId of Object.values(templateFolderMap)) {
      counts[folderId] = (counts[folderId] ?? 0) + 1;
    }
    return counts;
  }, [templateFolderMap]);

  const allFoldersFlat = useMemo(() => {
    const result: Array<{ id: string; name: string; depth: number }> = [];
    function walk(nodes: IFolderNode[], depth: number) {
      for (const n of nodes) {
        result.push({ id: n.id, name: n.name, depth });
        walk(n.children, depth + 1);
      }
    }
    walk(folderTree, 0);
    return result;
  }, [folderTree]);

  // Filter + sort templates
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];

    let list = [...templates];

    // Filter by folder
    if (selectedFolderId) {
      // Get all descendant folder IDs including selected
      const descendantIds = new Set<string>();
      function collectDescendants(folderId: string) {
        descendantIds.add(folderId);
        for (const f of folders) {
          if (f.parentId === folderId) {
            collectDescendants(f.id);
          }
        }
      }
      collectDescendants(selectedFolderId);
      list = list.filter(t => {
        const fId = templateFolderMap[t.id];
        return fId && descendantIds.has(fId);
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)),
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'updated_at') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      // run_count: we don't have real run counts yet, sort by name as fallback
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [templates, selectedFolderId, searchQuery, sortBy, folders, templateFolderMap]);

  // --- Folder CRUD ---
  const handleCreateFolder = useCallback(() => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    const newFolder: IFolder = {
      id: generateId(),
      name: trimmed,
      parentId: newFolderParentId,
    };
    setFolders(prev => [...prev, newFolder]);
    setNewFolderOpen(false);
    setNewFolderName('');
    setNewFolderParentId(null);
  }, [newFolderName, newFolderParentId]);

  const handleRenameFolder = useCallback((id: string, name: string) => {
    setFolders(prev => prev.map(f => (f.id === id ? { ...f, name } : f)));
  }, []);

  const handleDeleteFolder = useCallback((id: string) => {
    // Remove folder and all children recursively
    const toRemove = new Set<string>();
    function collectIds(folderId: string) {
      toRemove.add(folderId);
      for (const f of folders) {
        if (f.parentId === folderId) collectIds(f.id);
      }
    }
    collectIds(id);
    setFolders(prev => prev.filter(f => !toRemove.has(f.id)));
    // Remove template associations
    setTemplateFolderMap(prev => {
      const next = { ...prev };
      for (const [tId, fId] of Object.entries(next)) {
        if (toRemove.has(fId)) delete next[tId];
      }
      return next;
    });
    if (selectedFolderId && toRemove.has(selectedFolderId)) {
      setSelectedFolderId(null);
    }
    setDeleteFolderId(null);
  }, [folders, selectedFolderId]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedFolderIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // --- Template actions ---
  const handleDuplicate = useCallback(async (template: ITemplateWithMeta) => {
    try {
      const res = await fetch('/api/db/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Copy of ${template.name}`,
          description: template.description,
          is_active: false,
          cover_image_url: template.cover_image_url,
          trigger_config: template.trigger_config,
          created_by: template.created_by,
        }),
      });
      if (!res.ok) throw new Error('Failed to duplicate');

      // Also duplicate tasks
      const detailRes = await fetch(`/api/db/templates/${template.id}`);
      if (detailRes.ok) {
        const detailJson = await detailRes.json();
        const sourceTasks = detailJson.data?.template_tasks ?? [];
        const newTemplateJson = await res.json();
        const newTemplateId = newTemplateJson.data?.id;

        if (newTemplateId && sourceTasks.length > 0) {
          const tasksToCreate = sourceTasks.map((t: ITemplateTask) => ({
            template_id: newTemplateId,
            title: t.title,
            description: t.description,
            section: t.section,
            order_index: t.order_index,
            assignee_type: t.assignee_type,
            due_date_type: t.due_date_type,
            due_date_offset_days: t.due_date_offset_days,
            task_type: t.task_type,
            metadata: t.metadata,
            hidden_by_default: t.hidden_by_default,
            is_stop_gate: t.is_stop_gate,
            permissions: t.permissions,
            automations: t.automations,
            ps_group_id: null,
          }));
          await fetch(`/api/db/templates/${newTemplateId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tasks: tasksToCreate }),
          });
        }
      }

      mutate();
    } catch (err) {
      console.error('Duplicate failed:', err);
    }
  }, [mutate]);

  const handleArchive = useCallback(async (templateId: string) => {
    try {
      await fetch(`/api/db/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false }),
      });
      mutate();
    } catch (err) {
      console.error('Archive failed:', err);
    }
  }, [mutate]);

  const handleMoveToFolder = useCallback(() => {
    if (moveTemplateId) {
      setTemplateFolderMap(prev => {
        const next = { ...prev };
        if (moveTargetFolderId) {
          next[moveTemplateId] = moveTargetFolderId;
        } else {
          delete next[moveTemplateId];
        }
        return next;
      });
    }
    setMoveTemplateId(null);
    setMoveTargetFolderId(null);
  }, [moveTemplateId, moveTargetFolderId]);

  const handleExportJson = useCallback((template: ITemplateWithMeta) => {
    const json = JSON.stringify(template, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // --- Sort options ---
  const sortOptions = [
    { label: 'Last Modified', value: 'updated_at' as ISortOption },
    { label: 'Name', value: 'name' as ISortOption },
    { label: 'Run Count', value: 'run_count' as ISortOption },
  ];

  // --- Loading / error ---
  if (isLoading) return <LoadingState message="Loading templates..." />;
  if (error) return <ErrorState message={error.message} onRetry={() => mutate()} />;

  // --- Editor mode ---
  if (editingId) {
    return (
      <div className={styles.container}>
        <TemplateEditorPage
          templateId={editingId}
          onBack={() => setEditingId(null)}
        />
      </div>
    );
  }

  // --- Library view ---
  return (
    <>
      <div className={styles.libraryLayout}>
        {/* ===== Folder Sidebar ===== */}
        <div className={styles.folderSidebar}>
          <div className={styles.folderSidebarHeader}>Folders</div>
          <div className={styles.folderTree}>
            {/* All Templates */}
            <div
              className={`${styles.folderItem} ${selectedFolderId === null ? styles.folderItemActive : ''}`}
              onClick={() => setSelectedFolderId(null)}
            >
              <span className={styles.folderChevronPlaceholder} />
              <span className={styles.allTemplatesIcon}>
                <DocsIcon size={16} />
              </span>
              <span className={styles.folderName}>All Templates</span>
              <span className={styles.folderCount}>{templates?.length ?? 0}</span>
            </div>

            {/* Folder tree */}
            {folderTree.map(node => (
              <FolderTreeNode
                key={node.id}
                node={node}
                selectedFolderId={selectedFolderId}
                expandedIds={expandedFolderIds}
                templateCountByFolder={templateCountByFolder}
                onSelect={setSelectedFolderId}
                onToggle={toggleExpanded}
                onRename={handleRenameFolder}
                onDelete={id => setDeleteFolderId(id)}
              />
            ))}
          </div>

          <button
            className={styles.addFolderBtn}
            onClick={() => setNewFolderOpen(true)}
          >
            <PlusIcon size={14} />
            New Folder
          </button>
        </div>

        {/* ===== Main Area ===== */}
        <div className={styles.mainArea}>
          <div className={styles.mainHeader}>
            <div className={styles.mainHeaderLeft}>
              <h2 className={styles.mainTitle}>
                {selectedFolderId
                  ? folders.find(f => f.id === selectedFolderId)?.name ?? 'Templates'
                  : 'All Templates'}
              </h2>
              <div className={styles.searchWrapper}>
                <Input
                  prefix={<SearchIcon size={16} />}
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  size="sm"
                />
              </div>
            </div>
            <div className={styles.mainHeaderRight}>
              <div className={styles.sortSelect}>
                <Select
                  options={sortOptions}
                  value={sortOptions.find(o => o.value === sortBy) ?? null}
                  onChange={opt => {
                    if (opt) setSortBy(opt.value);
                  }}
                  size="sm"
                  placeholder="Sort by..."
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={14} />}
                onClick={() => {
                  // Create a new blank template then open editor
                  fetch('/api/db/templates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: 'Untitled Template',
                      description: null,
                      is_active: false,
                      cover_image_url: null,
                      trigger_config: { type: 'manual' },
                      created_by: null,
                    }),
                  })
                    .then(res => res.json())
                    .then(json => {
                      if (json.data?.id) {
                        mutate();
                        setEditingId(json.data.id);
                      }
                    })
                    .catch(console.error);
                }}
              >
                New Template
              </Button>
            </div>
          </div>

          {/* Template List */}
          <div className={styles.templateList}>
            {filteredTemplates.length === 0 ? (
              <div className={styles.emptyState}>
                <FileIcon size={48} className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>
                  {searchQuery ? 'No templates match your search' : 'No templates in this folder'}
                </h3>
                <p className={styles.emptySubtitle}>
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Create a new template or move one here'}
                </p>
              </div>
            ) : (
              filteredTemplates.map(template => {
                const taskCount = getTaskCount(template);
                const folderName = templateFolderMap[template.id]
                  ? folders.find(f => f.id === templateFolderMap[template.id])?.name
                  : null;
                const isPublished = template.is_active;

                return (
                  <div
                    key={template.id}
                    className={styles.templateRow}
                    onClick={() => setEditingId(template.id)}
                  >
                    {/* Cover image */}
                    {template.cover_image_url ? (
                      <img
                        src={template.cover_image_url}
                        alt=""
                        className={styles.templateCover}
                      />
                    ) : (
                      <div className={styles.templateCoverPlaceholder}>
                        <FileIcon size={20} />
                      </div>
                    )}

                    {/* Info */}
                    <div className={styles.templateInfo}>
                      <div className={styles.templateNameRow}>
                        <span className={styles.templateName}>{template.name}</span>
                      </div>
                      {template.description && (
                        <span className={styles.templateDescription}>
                          {template.description}
                        </span>
                      )}
                      <div className={styles.templateMeta}>
                        {folderName && (
                          <span className={styles.folderBadge}>
                            <FolderListIcon size={10} />
                            {folderName}
                          </span>
                        )}
                        {isPublished ? (
                          <span className={styles.statusBadgePublished}>Published</span>
                        ) : (
                          <span className={styles.statusBadgeDraft}>Draft</span>
                        )}
                        <span className={styles.metaSeparator}>|</span>
                        <span className={styles.runCountPill}>0 runs</span>
                        <span className={styles.metaSeparator}>|</span>
                        <span className={styles.metaText}>
                          {taskCount} task{taskCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Right side: date + actions */}
                    <div className={styles.templateActions}>
                      <span className={styles.lastEdited}>{formatDate(template.updated_at)}</span>
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={e => {
                          e.stopPropagation();
                          setEditingId(template.id);
                        }}
                      >
                        Edit
                      </Button>
                      <MenuButton
                        action={
                          <Button
                            size="sm"
                            variant="subtle"
                            onClick={e => e.stopPropagation()}
                          >
                            ...
                          </Button>
                        }
                      >
                        <Menu>
                          <MenuItem
                            icon={<EditIcon size={14} />}
                            onClick={() => setEditingId(template.id)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<CopyIcon size={14} />}
                            onClick={() => handleDuplicate(template)}
                          >
                            Duplicate
                          </MenuItem>
                          <MenuItem
                            icon={<FolderListIcon size={14} />}
                            onClick={() => {
                              setMoveTemplateId(template.id);
                              setMoveTargetFolderId(templateFolderMap[template.id] ?? null);
                            }}
                          >
                            Move to folder
                          </MenuItem>
                          <MenuItem
                            icon={<TrashCanIcon size={14} />}
                            onClick={() => handleArchive(template.id)}
                          >
                            Archive
                          </MenuItem>
                          <MenuItem
                            icon={<FileIcon size={14} />}
                            onClick={() => handleExportJson(template)}
                          >
                            Export as JSON
                          </MenuItem>
                        </Menu>
                      </MenuButton>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ===== New Folder Dialog ===== */}
      <Dialog
        open={newFolderOpen}
        onClose={() => {
          setNewFolderOpen(false);
          setNewFolderName('');
          setNewFolderParentId(null);
        }}
        label="New Folder"
        actions={
          <>
            <Button
              variant="subtle"
              onClick={() => {
                setNewFolderOpen(false);
                setNewFolderName('');
                setNewFolderParentId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!newFolderName.trim()}
              onClick={handleCreateFolder}
            >
              Create
            </Button>
          </>
        }
      >
        <div className={styles.dialogField}>
          <Input
            label="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newFolderName.trim()) handleCreateFolder();
            }}
            autoFocus
          />
          <Select
            label="Parent folder (optional)"
            options={[
              { label: 'None (top level)', value: '__none__' },
              ...allFoldersFlat.map(f => ({
                label: `${'  '.repeat(f.depth)}${f.name}`,
                value: f.id,
              })),
            ]}
            value={
              newFolderParentId
                ? {
                    label: folders.find(f => f.id === newFolderParentId)?.name ?? '',
                    value: newFolderParentId,
                  }
                : { label: 'None (top level)', value: '__none__' }
            }
            onChange={opt => {
              setNewFolderParentId(opt?.value === '__none__' ? null : opt?.value ?? null);
            }}
          />
        </div>
      </Dialog>

      {/* ===== Delete Folder Confirmation ===== */}
      <Dialog
        open={deleteFolderId !== null}
        onClose={() => setDeleteFolderId(null)}
        label="Delete Folder"
        actions={
          <>
            <Button variant="subtle" onClick={() => setDeleteFolderId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteFolderId) handleDeleteFolder(deleteFolderId);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className={styles.deleteConfirmText}>
          Are you sure you want to delete this folder? Templates inside it will be unassigned, not
          deleted.
        </p>
      </Dialog>

      {/* ===== Move to Folder Dialog ===== */}
      <Dialog
        open={moveTemplateId !== null}
        onClose={() => {
          setMoveTemplateId(null);
          setMoveTargetFolderId(null);
        }}
        label="Move to Folder"
        actions={
          <>
            <Button
              variant="subtle"
              onClick={() => {
                setMoveTemplateId(null);
                setMoveTargetFolderId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleMoveToFolder}>
              Move
            </Button>
          </>
        }
      >
        <Select
          label="Destination folder"
          options={[
            { label: 'No folder', value: '__none__' },
            ...allFoldersFlat.map(f => ({
              label: `${'  '.repeat(f.depth)}${f.name}`,
              value: f.id,
            })),
          ]}
          value={
            moveTargetFolderId
              ? {
                  label: folders.find(f => f.id === moveTargetFolderId)?.name ?? '',
                  value: moveTargetFolderId,
                }
              : { label: 'No folder', value: '__none__' }
          }
          onChange={opt => {
            setMoveTargetFolderId(opt?.value === '__none__' ? null : opt?.value ?? null);
          }}
        />
      </Dialog>
    </>
  );
}

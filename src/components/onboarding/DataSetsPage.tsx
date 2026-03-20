'use client';

import { useState, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Badge } from '@zonos/amino/components/badge/Badge';
import { Input } from '@zonos/amino/components/input/Input';
import { Dialog } from '@zonos/amino/components/dialog/Dialog';
import { VStack } from '@zonos/amino/components/stack/VStack';
import { ArrowUpIcon } from '@zonos/amino/icons/ArrowUpIcon';
import { ArrowDownIcon } from '@zonos/amino/icons/ArrowDownIcon';
import { RemoveCircleIcon } from '@zonos/amino/icons/RemoveCircleIcon';
import styles from './DataSetsPage.module.scss';

type IDataSetItem = {
  id: string;
  value: string;
};

type IDataSet = {
  id: string;
  name: string;
  description: string;
  items: IDataSetItem[];
  created_at: string;
};

function generateId(): string {
  return `ds-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateItemId(): string {
  return `dsi-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const INITIAL_DATA_SETS: IDataSet[] = [
  {
    id: generateId(),
    name: 'E-Commerce Platforms',
    description: 'Common e-commerce platforms merchants use for their online stores.',
    items: [
      { id: generateItemId(), value: 'Shopify' },
      { id: generateItemId(), value: 'BigCommerce' },
      { id: generateItemId(), value: 'WooCommerce' },
      { id: generateItemId(), value: 'Magento' },
      { id: generateItemId(), value: 'Salesforce Commerce Cloud' },
      { id: generateItemId(), value: 'Cart.com' },
      { id: generateItemId(), value: 'MIVA' },
      { id: generateItemId(), value: 'Wix' },
      { id: generateItemId(), value: 'X-Cart' },
      { id: generateItemId(), value: 'Custom / Headless' },
    ],
    created_at: '2026-03-01T12:00:00Z',
  },
  {
    id: generateId(),
    name: 'Carrier Names',
    description: 'Shipping carriers available for rate configuration and label generation.',
    items: [
      { id: generateItemId(), value: 'UPS' },
      { id: generateItemId(), value: 'FedEx' },
      { id: generateItemId(), value: 'DHL Express' },
      { id: generateItemId(), value: 'USPS' },
      { id: generateItemId(), value: 'Canada Post' },
      { id: generateItemId(), value: 'Royal Mail' },
      { id: generateItemId(), value: 'Australia Post' },
      { id: generateItemId(), value: 'DPD' },
      { id: generateItemId(), value: 'GLS' },
    ],
    created_at: '2026-03-05T14:30:00Z',
  },
  {
    id: generateId(),
    name: 'Countries (ISO)',
    description: 'Frequently referenced countries by ISO 3166-1 alpha-2 code.',
    items: [
      { id: generateItemId(), value: 'US - United States' },
      { id: generateItemId(), value: 'CA - Canada' },
      { id: generateItemId(), value: 'GB - United Kingdom' },
      { id: generateItemId(), value: 'AU - Australia' },
      { id: generateItemId(), value: 'DE - Germany' },
      { id: generateItemId(), value: 'FR - France' },
      { id: generateItemId(), value: 'JP - Japan' },
      { id: generateItemId(), value: 'CN - China' },
      { id: generateItemId(), value: 'MX - Mexico' },
      { id: generateItemId(), value: 'BR - Brazil' },
      { id: generateItemId(), value: 'IN - India' },
      { id: generateItemId(), value: 'KR - South Korea' },
    ],
    created_at: '2026-03-08T09:15:00Z',
  },
  {
    id: generateId(),
    name: 'Label Software',
    description: 'Label printing and shipping software integrations.',
    items: [
      { id: generateItemId(), value: 'ShipStation' },
      { id: generateItemId(), value: 'ShipBob' },
      { id: generateItemId(), value: 'EasyPost' },
      { id: generateItemId(), value: 'Shippo' },
      { id: generateItemId(), value: 'Pirate Ship' },
      { id: generateItemId(), value: 'Stamps.com' },
    ],
    created_at: '2026-03-12T16:45:00Z',
  },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

type IDataSetDetailProps = {
  dataSet: IDataSet;
  onUpdate: (updated: IDataSet) => void;
  onDelete: () => void;
};

function DataSetDetail({ dataSet, onUpdate, onDelete }: IDataSetDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(dataSet.name);
  const [editDescription, setEditDescription] = useState(dataSet.description);
  const [newItemValue, setNewItemValue] = useState('');

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    onUpdate({
      ...dataSet,
      name: editName.trim(),
      description: editDescription.trim(),
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(dataSet.name);
    setEditDescription(dataSet.description);
    setIsEditing(false);
  };

  const handleAddItem = () => {
    const trimmed = newItemValue.trim();
    if (!trimmed) return;
    onUpdate({
      ...dataSet,
      items: [...dataSet.items, { id: generateItemId(), value: trimmed }],
    });
    setNewItemValue('');
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdate({
      ...dataSet,
      items: dataSet.items.filter(i => i.id !== itemId),
    });
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...dataSet.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[targetIndex];
    newItems[targetIndex] = newItems[index];
    newItems[index] = temp;
    onUpdate({ ...dataSet, items: newItems });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div className={styles.detail}>
      <div className={styles.detailHeader}>
        {isEditing ? (
          <div className={styles.editFields}>
            <Input
              label="Name"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
            <Input
              label="Description"
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
            />
            <div className={styles.detailActions}>
              <Button size="sm" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveEdit}
                disabled={!editName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.detailTitleRow}>
              <h2 className={styles.detailTitle}>{dataSet.name}</h2>
              <div className={styles.detailActions}>
                <Button size="sm" variant="subtle" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button size="sm" variant="danger" onClick={onDelete}>
                  Delete
                </Button>
              </div>
            </div>
            {dataSet.description && (
              <p className={styles.detailDesc}>{dataSet.description}</p>
            )}
          </>
        )}
      </div>

      <div className={styles.itemsSection}>
        <div className={styles.itemsSectionHeader}>
          <span className={styles.itemsSectionTitle}>Items</span>
          <span className={styles.itemsSectionCount}>
            {dataSet.items.length} item{dataSet.items.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={styles.itemsList}>
          {dataSet.items.map((item, index) => (
            <div key={item.id} className={styles.itemRow}>
              <span>{item.value}</span>
              <div className={styles.itemRowActions}>
                <button
                  className={styles.moveButton}
                  onClick={() => handleMoveItem(index, 'up')}
                  disabled={index === 0}
                  title="Move up"
                >
                  <ArrowUpIcon size={14} />
                </button>
                <button
                  className={styles.moveButton}
                  onClick={() => handleMoveItem(index, 'down')}
                  disabled={index === dataSet.items.length - 1}
                  title="Move down"
                >
                  <ArrowDownIcon size={14} />
                </button>
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remove item"
                >
                  <RemoveCircleIcon size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.addItemRow}>
          <div className={styles.addItemInput}>
            <Input
              size="sm"
              value={newItemValue}
              onChange={e => setNewItemValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new item..."
            />
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={handleAddItem}
            disabled={!newItemValue.trim()}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DataSetsPage() {
  const [dataSets, setDataSets] = useState<IDataSet[]>(INITIAL_DATA_SETS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = useCallback(() => {
    if (!newName.trim()) return;
    const created: IDataSet = {
      id: generateId(),
      name: newName.trim(),
      description: newDescription.trim(),
      items: [],
      created_at: new Date().toISOString(),
    };
    setDataSets(prev => [created, ...prev]);
    setSelectedId(created.id);
    setNewName('');
    setNewDescription('');
    setCreateOpen(false);
  }, [newName, newDescription]);

  const handleUpdate = useCallback((updated: IDataSet) => {
    setDataSets(prev => prev.map(ds => (ds.id === updated.id ? updated : ds)));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDataSets(prev => prev.filter(ds => ds.id !== id));
    setSelectedId(null);
  }, []);

  const handleCreateClose = () => {
    setNewName('');
    setNewDescription('');
    setCreateOpen(false);
  };

  const selectedDataSet = dataSets.find(ds => ds.id === selectedId);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Data Sets</h1>
          <p className={styles.subtitle}>
            {dataSets.length} data set{dataSets.length !== 1 ? 's' : ''} — reusable option lists for template widgets
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          New Data Set
        </Button>
      </div>

      <div className={styles.cardList}>
        {dataSets.length === 0 && (
          <div className={styles.emptyState}>
            No data sets yet. Create one to get started.
          </div>
        )}
        {dataSets.map(ds => (
          <div
            key={ds.id}
            className={`${styles.card} ${selectedId === ds.id ? styles.cardActive : ''}`}
            onClick={() => setSelectedId(selectedId === ds.id ? null : ds.id)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>{ds.name}</span>
              <div className={styles.cardMeta}>
                <Badge color="blue">
                  {ds.items.length} item{ds.items.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            {ds.description && (
              <p className={styles.cardDesc}>{ds.description}</p>
            )}
            <div className={styles.cardFooter}>
              <span>Created {formatDate(ds.created_at)}</span>
            </div>
          </div>
        ))}
      </div>

      {selectedDataSet && (
        <DataSetDetail
          key={selectedDataSet.id}
          dataSet={selectedDataSet}
          onUpdate={handleUpdate}
          onDelete={() => handleDelete(selectedDataSet.id)}
        />
      )}

      <Dialog
        open={createOpen}
        onClose={handleCreateClose}
        label="New data set"
        actions={
          <>
            <Button onClick={handleCreateClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              Create
            </Button>
          </>
        }
      >
        <VStack spacing={16}>
          <Input
            label="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Carrier Names"
            required
          />
          <Input
            label="Description"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="What this data set is used for"
          />
        </VStack>
      </Dialog>
    </div>
  );
}

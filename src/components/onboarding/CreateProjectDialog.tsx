'use client';

import { useState } from 'react';
import { Dialog } from '@zonos/amino/components/dialog/Dialog';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Select } from '@zonos/amino/components/select/Select';
import { VStack } from '@zonos/amino/components/stack/VStack';
import { useOnboardingNavStore } from '@/hooks/useOnboardingNavStore';

type ICreateProjectDialogProps = {
  open: boolean;
  onClose: () => void;
};

const PLATFORM_OPTIONS = [
  { value: 'Shopify', label: 'Shopify' },
  { value: 'BigCommerce', label: 'BigCommerce' },
  { value: 'WooCommerce', label: 'WooCommerce' },
  { value: 'Magento', label: 'Magento' },
  { value: 'Custom', label: 'Custom' },
];

const TEMPLATE_ID = 'a0000000-0000-0000-0000-000000000001';

export function CreateProjectDialog({ open, onClose }: ICreateProjectDialogProps) {
  const [merchantName, setMerchantName] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [platform, setPlatform] = useState<{ value: string; label: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openProject = useOnboardingNavStore(s => s.openProject);

  const handleCreate = async () => {
    if (!merchantName.trim() || !merchantId.trim()) {
      setError('Merchant name and ID are required.');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // 1. Create the project
      const res = await fetch('/api/db/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_name: merchantName.trim(),
          merchant_id: merchantId.trim(),
          store_url: storeUrl.trim() || null,
          platform: platform?.value ?? null,
          template_id: TEMPLATE_ID,
          start_date: new Date().toISOString().split('T')[0],
          status: 'not_started',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || 'Failed to create project');
      }

      const { data: project } = await res.json();

      // 2. Instantiate tasks from template
      const instantiateRes = await fetch(`/api/db/projects/${project.id}/instantiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: TEMPLATE_ID }),
      });

      if (!instantiateRes.ok) {
        const body = await instantiateRes.json().catch(() => ({ error: 'Failed to instantiate' }));
        throw new Error(body.error || 'Failed to create tasks from template');
      }

      // 3. Navigate to the new project
      onClose();
      openProject(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    setMerchantName('');
    setMerchantId('');
    setStoreUrl('');
    setPlatform(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      label="New onboarding project"
      actions={
        <>
          <Button onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={isCreating}
            disabled={!merchantName.trim() || !merchantId.trim()}
          >
            Create project
          </Button>
        </>
      }
    >
      <VStack spacing={16}>
        <Input
          label="Merchant name"
          value={merchantName}
          onChange={e => setMerchantName(e.target.value)}
          placeholder="e.g. Acme International"
          required
        />
        <Input
          label="Merchant ID (store number)"
          value={merchantId}
          onChange={e => setMerchantId(e.target.value)}
          placeholder="e.g. 5782"
          required
        />
        <Input
          label="Store URL"
          value={storeUrl}
          onChange={e => setStoreUrl(e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
        <Select
          label="Platform"
          value={platform}
          options={PLATFORM_OPTIONS}
          onChange={opt => setPlatform(opt)}
        />
        {error && (
          <p style={{ color: 'var(--amino-red-600)', fontSize: 13, margin: 0 }}>
            {error}
          </p>
        )}
      </VStack>
    </Dialog>
  );
}

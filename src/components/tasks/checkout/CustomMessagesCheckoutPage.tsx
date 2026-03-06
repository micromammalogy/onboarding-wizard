'use client';

import { useState, useCallback } from 'react';
import { Button } from '@zonos/amino/components/button/Button';
import { Input } from '@zonos/amino/components/input/Input';
import { Text } from '@zonos/amino/components/text/Text';
import { useGraphQL } from '@/hooks/useGraphQL';
import { useGraphQLMutation } from '@/hooks/useGraphQLMutation';
import {
  CUSTOM_MESSAGES_QUERY,
  type ICustomMessagesData,
  type ICustomMessageNode,
} from '@/graphql/queries/customMessages';
import {
  CUSTOM_MESSAGES_INSERT,
  CUSTOM_MESSAGES_DELETE,
} from '@/graphql/mutations/customMessages';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

const PAGE_OPTIONS = [
  { label: 'Default', value: 'checkout_default' },
  { label: 'Customer info', value: 'checkout_customer_info' },
  { label: 'Shipping info', value: 'checkout_shipping_info' },
  { label: 'Payment info', value: 'checkout_payment_info' },
] as const;

const sectionCard: React.CSSProperties = {
  padding: 24,
  background: 'white',
  borderRadius: 8,
  border: '1px solid var(--amino-gray-200)',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  margin: 0,
  color: 'var(--amino-gray-900)',
  paddingBottom: 8,
  borderBottom: '1px solid var(--amino-gray-100)',
};

type INewMessage = {
  textFrom: string;
  textTo: string;
  countryCodes: string;
  pageName: string;
};

const EMPTY_MESSAGE: INewMessage = {
  textFrom: '',
  textTo: '',
  countryCodes: '',
  pageName: 'checkout_default',
};

export const CustomMessagesCheckoutPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newMsg, setNewMsg] = useState<INewMessage>(EMPTY_MESSAGE);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const pageNames = PAGE_OPTIONS.map(p => p.value);

  const { data, error, isLoading, mutate } = useGraphQL<ICustomMessagesData>({
    query: CUSTOM_MESSAGES_QUERY,
    schema: 'frontend',
    variables: {
      storeId: 0,
      localeTo: 'en',
      pageNames,
      limit: 50,
      offset: 0,
    },
  });

  const { execute: insertMessages } = useGraphQLMutation({
    query: CUSTOM_MESSAGES_INSERT,
    schema: 'frontend',
  });

  const { execute: deleteMessages } = useGraphQLMutation({
    query: CUSTOM_MESSAGES_DELETE,
    schema: 'frontend',
  });

  const allMessages = data?.locale_countryCodesPage_aggregate?.nodes || [];
  const currentPageName = PAGE_OPTIONS[activeTab]?.value || 'checkout_default';
  const filteredMessages = allMessages.filter(
    n => n.pageName === currentPageName,
  );

  const updateField = useCallback(
    <K extends keyof INewMessage>(key: K, value: INewMessage[K]) => {
      setNewMsg(m => ({ ...m, [key]: value }));
    },
    [],
  );

  const handleCreate = async () => {
    if (!newMsg.textFrom.trim() || !newMsg.textTo.trim()) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const countries = newMsg.countryCodes
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);

      await insertMessages({
        localeMessages: [
          {
            textFrom: newMsg.textFrom,
            textTo: newMsg.textTo,
            localeFrom: 'en',
            localeTo: 'en',
          },
        ],
        countryCodesPage: [
          {
            countryCodes: `{${countries.join(',')}}`,
            pageName: currentPageName,
            storeId: 0,
          },
        ],
      });

      mutate();
      setNewMsg(EMPTY_MESSAGE);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (node: ICustomMessageNode) => {
    try {
      const linkIds = node.countryCodesPageMessageLinks.map(l => l.id);
      const messageIds = node.countryCodesPageMessageLinks.map(
        l => l.message.id,
      );

      await deleteMessages({
        messageIds,
        countryCodesPageIds: [node.id],
        linkIds,
      });
      mutate();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message || String(error)} />;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
        maxWidth: 720,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text type="title">Checkout Custom Messages</Text>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Message'}
        </Button>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: 'var(--amino-gray-500)' }}>
        Create custom translated messages that appear on different pages of the
        Zonos Checkout experience.
      </p>

      {submitError && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-red-600)' }}>
          {submitError}
        </p>
      )}

      {/* Page tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--amino-gray-200)',
        }}
      >
        {PAGE_OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: activeTab === i ? 600 : 400,
              color:
                activeTab === i
                  ? 'var(--amino-blue-600)'
                  : 'var(--amino-gray-500)',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === i
                  ? '2px solid var(--amino-blue-600)'
                  : '2px solid transparent',
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={sectionCard}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            New message for {PAGE_OPTIONS[activeTab]?.label}
          </p>
          <Input
            label="Original text"
            value={newMsg.textFrom}
            onChange={e => updateField('textFrom', e.target.value)}
            placeholder="Text in original language"
          />
          <Input
            label="Translated text"
            value={newMsg.textTo}
            onChange={e => updateField('textTo', e.target.value)}
            placeholder="Translated text to display"
          />
          <Input
            label="Country codes (comma-separated)"
            value={newMsg.countryCodes}
            onChange={e => updateField('countryCodes', e.target.value)}
            placeholder="e.g. US, CA, GB"
          />
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={submitting}
          >
            Save Message
          </Button>
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <div style={{ ...sectionCard, alignItems: 'center', padding: 48 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--amino-gray-400)',
            }}
          >
            No custom messages for this page. Click &quot;Add Message&quot; to
            create one.
          </p>
        </div>
      ) : (
        filteredMessages.map(node => (
          <div key={node.id} style={sectionCard}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--amino-gray-500)' }}>
                  Countries: {node.countryCodes?.join(', ') || 'All'}
                </p>
                {node.countryCodesPageMessageLinks.map(link => (
                  <div
                    key={link.id}
                    style={{
                      marginTop: 8,
                      padding: '8px 12px',
                      background: 'var(--amino-gray-50)',
                      borderRadius: 6,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13 }}>
                      <strong>From:</strong> {link.message.textFrom}
                    </p>
                    <p
                      style={{
                        margin: '4px 0 0',
                        fontSize: 13,
                      }}
                    >
                      <strong>To:</strong> {link.message.textTo}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(node)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

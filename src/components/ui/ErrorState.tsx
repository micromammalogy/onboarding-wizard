'use client';

import { Button } from '@zonos/amino/components/button/Button';

type IErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export const ErrorState = ({
  message = 'Something went wrong.',
  onRetry,
}: IErrorStateProps) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 64,
      gap: 16,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: 'var(--amino-red-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--amino-red-600)',
        fontSize: 20,
      }}
    >
      !
    </div>
    <p style={{ fontSize: 14, color: 'var(--amino-gray-700)', textAlign: 'center' }}>
      {message}
    </p>
    {onRetry && (
      <Button variant="subtle" size="sm" onClick={onRetry}>
        Retry
      </Button>
    )}
  </div>
);

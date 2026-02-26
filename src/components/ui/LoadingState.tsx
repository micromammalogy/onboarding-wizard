'use client';

import { Spinner } from '@zonos/amino/components/spinner/Spinner';

type ILoadingStateProps = {
  message?: string;
};

export const LoadingState = ({ message = 'Loading...' }: ILoadingStateProps) => (
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
    <Spinner />
    <p style={{ fontSize: 14, color: 'var(--amino-gray-500)' }}>{message}</p>
  </div>
);

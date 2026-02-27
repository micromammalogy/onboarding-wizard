'use client';

import { Input } from '@zonos/amino/components/input/Input';
import { Text } from '@zonos/amino/components/text/Text';

type IProps = {
  startsAt: string | null;
  endsAt: string | null;
  onStartsAtChange: (value: string | null) => void;
  onEndsAtChange: (value: string | null) => void;
};

export const RuleDateRange = ({
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
}: IProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Text type="bold-label" color="gray700">
        Schedule (optional)
      </Text>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input
          label="Start date"
          type="date"
          value={startsAt || ''}
          onChange={e =>
            onStartsAtChange(e.target.value || null)
          }
        />
        <Input
          label="End date"
          type="date"
          value={endsAt || ''}
          onChange={e =>
            onEndsAtChange(e.target.value || null)
          }
        />
      </div>
    </div>
  );
};

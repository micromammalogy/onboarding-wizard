import Image from 'next/image';
import type { IEcommercePlatform } from '@/hooks/useOnboardingStore';

type IProps = {
  platform: IEcommercePlatform;
  size?: number;
};

type IInitialConfig = {
  letter: string;
  bg: string;
  color: string;
};

const INITIALS: Partial<Record<IEcommercePlatform, IInitialConfig>> = {
  cart: { letter: 'C', bg: '#0055a5', color: '#fff' },
  custom: { letter: 'C', bg: '#6b7280', color: '#fff' },
  magento: { letter: 'M', bg: '#EE0000', color: '#fff' },
  miva: { letter: 'M', bg: '#f59e0b', color: '#fff' },
  salesforce: { letter: 'S', bg: '#00a1e0', color: '#fff' },
  wix: { letter: 'W', bg: '#000', color: '#fff' },
  xcart: { letter: 'X', bg: '#e85d04', color: '#fff' },
};

const SVG_ICONS: Partial<Record<IEcommercePlatform, string>> = {
  shopify: '/shopify-icon.svg',
  bigcommerce: '/bigcommerce-icon.svg',
  woocommerce: '/woocommerce-icon.svg',
};

export const PlatformLogo = ({ platform, size = 28 }: IProps) => {
  const svgSrc = SVG_ICONS[platform];
  if (svgSrc) {
    const bgColors: Partial<Record<IEcommercePlatform, string>> = {
      shopify: '#95bf47',
      bigcommerce: '#fff',
      woocommerce: '#fff',
    };
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: bgColors[platform] ?? '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Image
          src={svgSrc}
          alt={platform}
          width={Math.round(size * 0.65)}
          height={Math.round(size * 0.65)}
        />
      </div>
    );
  }

  const initials = INITIALS[platform];
  if (initials) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: initials.bg,
          color: initials.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.5),
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initials.letter}
      </div>
    );
  }

  return null;
};

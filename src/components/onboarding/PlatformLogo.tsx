import Image from 'next/image';
import { ZonosLogoIcon } from '@zonos/amino/icons/custom/logo/ZonosLogoIcon';
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
  magento: { letter: 'M', bg: '#EE0000', color: '#fff' },
  volusion: { letter: 'V', bg: '#005596', color: '#fff' },
  miva: { letter: 'M', bg: '#f59e0b', color: '#fff' },
};

const SVG_ICONS: Partial<Record<IEcommercePlatform, string>> = {
  shopify: '/shopify-icon.svg',
  etsy: '/etsy-icon.svg',
  bigcommerce: '/bigcommerce-icon.svg',
  woocommerce: '/woocommerce-icon.svg',
};

export const PlatformLogo = ({ platform, size = 28 }: IProps) => {
  if (platform === 'zonos') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 6,
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ZonosLogoIcon size={Math.round(size * 0.75)} />
      </div>
    );
  }

  const svgSrc = SVG_ICONS[platform];
  if (svgSrc) {
    const bgColors: Partial<Record<IEcommercePlatform, string>> = {
      shopify: '#95bf47',
      etsy: '#fff',
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

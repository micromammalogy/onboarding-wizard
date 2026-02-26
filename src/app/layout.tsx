import type { Metadata } from 'next';
import '@zonos/amino/amino.css';
import '@zonos/amino/reset.css';
import '@zonos/amino/theme.css';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: 'Zonos Onboarding Wizard',
  description: 'Guided onboarding for Zonos merchants',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

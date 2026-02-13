import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPAR - Pick Pet And Run',
  description: '동물 골라서 터치 한 번! 누가 질까?',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PPAR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFF8F0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="font-display bg-cream min-h-dvh antialiased">
        <div className="max-w-[393px] mx-auto min-h-dvh relative">
          {children}
        </div>
      </body>
    </html>
  );
}

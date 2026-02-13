import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coffee Derby',
  description: '누가 커피 살래? 터치 한 번에 결정!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Coffee Derby',
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

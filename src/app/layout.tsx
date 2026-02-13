import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-nunito',
});

export const metadata: Metadata = {
  title: 'Coffee Derby',
  description: '동물 친구들과 커피내기 한 판!',
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
      <body
        className={`${nunito.variable} font-display bg-cream min-h-dvh antialiased`}
      >
        <div className="max-w-[393px] mx-auto min-h-dvh relative">
          {children}
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}`,
          }}
        />
      </body>
    </html>
  );
}

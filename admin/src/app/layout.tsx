import type { Metadata } from 'next';
import StoreProvider from './StoreProvider';
import './globals.css';
import { Poppins, Space_Grotesk } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: 'Aski Admin',
  description: 'Aski Administration Panel',
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${poppins.variable}`}
    >
      <body className="bg-background font-sans">
        <StoreProvider>
          <NextTopLoader
            color="#7c5cff"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #7c5cff,0 0 5px #7c5cff"
            zIndex={99999}
          />
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import ModernHeader from '@/components/layout/Header';
import ModernFooter from '@/components/layout/Footer';
import { AppProvider } from '@/lib/store';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'ModernMart - Sleek Shopping Experience',
  description: 'Experience modern shopping redefined. Curated collections, premium vendors, and exceptional service.',
  keywords: 'modern, marketplace, shopping, premium, vendors, sleek',
  authors: [{ name: 'ModernMart Team' }],
  openGraph: {
    title: 'ModernMart - Sleek Shopping Experience',
    description: 'Experience modern shopping redefined',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-white text-primary">
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <ModernHeader />
            <main className="flex-1">
              {children}
            </main>
            <ModernFooter />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}

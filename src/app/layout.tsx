import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import LuxuryHeader from '@/components/layout/Header';
import ModernFooter from '@/components/layout/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { ComparisonProvider } from '@/contexts/ComparisonContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'LUXURIA - Premium Marketplace',
  description: 'Experience luxury shopping redefined. Curated collections, exclusive boutiques, and elevated service.',
  keywords: 'luxury, premium, marketplace, exclusive, boutique, designer, high-end',
  authors: [{ name: 'Luxuria Team' }],
  openGraph: {
    title: 'LUXURIA - Premium Marketplace',
    description: 'Experience luxury shopping redefined',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-[var(--obsidian)] via-[var(--charcoal)] to-[var(--midnight)] text-[var(--pearl)]">
        <CartProvider>
          <WishlistProvider>
            <ComparisonProvider>
              <div className="min-h-screen flex flex-col">
                <LuxuryHeader />
                <main className="flex-1">
                  {children}
                </main>
                <ModernFooter />
              </div>
              <Toaster />
            </ComparisonProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

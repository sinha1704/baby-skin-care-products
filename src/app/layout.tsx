import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartSidebar } from '../components/CartSidebar';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Nurture & Dew | Premium Organic Baby Skin Care',
  description: 'Dermatologist-tested, pH-balanced organic baby skin care products crafted with calming botanicals for delicate skin. Nurture your baby\'s skin with pure ingredients.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Nurture & Dew | Premium Organic Baby Skin Care',
    description: 'pH-balanced organic baby skin care products crafted with calming botanicals for delicate skin.',
    url: '/',
    siteName: 'Nurture & Dew',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
        alt: 'Nurture & Dew Premium Baby Skin Care',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nurture & Dew | Premium Organic Baby Skin Care',
    description: 'pH-balanced organic baby skin care products crafted with calming botanicals for delicate skin.',
    images: ['https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=1200'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-charcoal selection:bg-primary-200 selection:text-primary-900">
        <Navbar />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
        <CartSidebar />
      </body>
    </html>
  );
}

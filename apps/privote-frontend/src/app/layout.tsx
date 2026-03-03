import { Background, Header, Providers } from '@/components/shared';
import { Analytics } from '@vercel/analytics/next';
import '@rainbow-me/rainbowkit/styles.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import 'react-tooltip/dist/react-tooltip.css';

const satoshiRegular = localFont({
  src: './fonts/Satoshi-Regular.woff',
  variable: '--font-satoshi-regular',
  weight: '400'
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 3000}`);

const title = 'Privote';
const titleTemplate = '%s | Privote';
const description =
  'Experience truly private, secure, and verifiable voting. Eliminate risks of bribery and coercion with results that are cryptographically accurate.';
export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: title,
    template: titleTemplate
  },
  description,
  keywords: ['voting', 'MACI', 'privacy', 'blockchain', 'web3', 'polls', 'governance', 'zero-knowledge'],
  authors: [{ name: 'Privote' }],
  creator: 'Privote',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'Privote',
    title: {
      default: title,
      template: titleTemplate
    },
    description
    // opengraph-image.tsx will be automatically used
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      default: title,
      template: titleTemplate
    },
    description,
    creator: '@privote',
    site: '@privote'
    // opengraph-image.tsx will be used for Twitter as well
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <script
          async
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        />
      </head>
      <body className={`${satoshiRegular.variable}`} suppressHydrationWarning>
        <Providers>
          <Background />
          <Header />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}

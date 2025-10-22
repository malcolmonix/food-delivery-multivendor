import type { Metadata } from 'next';
import './globals.css';
import { ConditionalConnectionStatus } from '../components/ConditionalConnectionStatus';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Multivendor Admin',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'en'; // Default locale
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ConditionalConnectionStatus />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

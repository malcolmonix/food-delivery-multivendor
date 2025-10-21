import type { Metadata } from 'next';
import './globals.css';
import { ConditionalConnectionStatus } from '../components/ConditionalConnectionStatus';

export const metadata: Metadata = {
  title: 'Multivendor Admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConditionalConnectionStatus />
        {children}
      </body>
    </html>
  );
}

import type { AppProps } from 'next/app';
import React from 'react';
import { CartProvider } from '../lib/context/cart.context';
import { ToastProvider } from '../lib/context/toast.context';
import { ErrorBoundary } from '../lib/components/error-boundary';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

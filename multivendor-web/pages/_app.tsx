import type { AppProps } from 'next/app';
import React from 'react';
import { CartProvider } from '../lib/cart';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}

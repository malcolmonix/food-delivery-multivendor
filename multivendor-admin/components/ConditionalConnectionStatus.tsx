/**
 * Conditional Connection Status Component
 * Only renders on non-login pages to prevent IndexedDB issues during authentication
 */
"use client";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConnectionStatus } from './ConnectionStatus';

export function ConditionalConnectionStatus() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by only rendering after client-side mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render on login page or before client-side hydration
  if (!isClient || pathname === '/authentication/login') {
    return null;
  }

  return (
    <div className="fixed top-2 right-2 z-50">
      <ConnectionStatus />
    </div>
  );
}

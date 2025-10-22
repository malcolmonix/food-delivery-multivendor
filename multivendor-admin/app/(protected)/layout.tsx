'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { loadUser, clearUser, type User as AuthUser } from '@/lib/utils/auth';
import { ApolloProvider } from '@apollo/client';
import { useSetupApollo } from '@/lib/hooks/useSetApollo';

// Context Providers
import { LayoutProvider } from '@/lib/context/global/layout.context';
import { ToastProvider } from '@/lib/context/global/toast.context';
import { ConfigurationProvider } from '@/lib/context/global/configuration.context';
import { UserProvider } from '@/lib/context/global/user-context';
import { RestaurantsProvider } from '@/lib/context/super-admin/restaurants.context';

// Layout Components
import SuperAdminLayout from '@/lib/ui/layouts/protected/super-admin';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const client = useSetupApollo();

  useEffect(() => {
    const u = loadUser();
    if (!u?.token) {
      router.replace('/authentication/login');
    } else {
      setUser(u);
    }
  }, [router]);

  if (!user?.token) return null;

  return (
    <ApolloProvider client={client}>
      <UserProvider>
        <LayoutProvider>
          <ToastProvider>
            <ConfigurationProvider>
              <RestaurantsProvider>
                <SuperAdminLayout>
                  {children}
                </SuperAdminLayout>
              </RestaurantsProvider>
            </ConfigurationProvider>
          </ToastProvider>
        </LayoutProvider>
      </UserProvider>
    </ApolloProvider>
  );
}
'use client';

// Core
import { ApolloProvider } from '@apollo/client';

// Prime React
import { PrimeReactProvider } from 'primereact/api';

// Providers
import { LayoutProvider } from '@/lib/context/global/layout.context';
import { SidebarProvider } from '@/lib/context/global/sidebar.context';
import { UserProvider } from '@/lib/context/global/user-context';

// Context
import { ConfigurationProvider } from '@/lib/context/global/configuration.context';
import { ToastProvider } from '@/lib/context/global/toast.context';

// Configuration
import { FontawesomeConfig } from '@/lib/config';

// Styles
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primeicons/primeicons.css';
import './global.css';

// Apollo
import { useSetupApollo } from '@/lib/hooks/useSetApollo';

export default function LocalizedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Apollo
  const client = useSetupApollo();

  // Constants
  const value = {
    ripple: true,
  };

  return (
    <>
      <FontawesomeConfig />
      <PrimeReactProvider value={value}>
        <ApolloProvider client={client}>
          <ConfigurationProvider>
            <LayoutProvider>
              <UserProvider>
                <SidebarProvider>
                  <ToastProvider>{children}</ToastProvider>
                </SidebarProvider>
              </UserProvider>
            </LayoutProvider>
          </ConfigurationProvider>
        </ApolloProvider>
      </PrimeReactProvider>
    </>
  );
}

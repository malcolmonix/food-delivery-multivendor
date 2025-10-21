/* eslint-disable react-hooks/exhaustive-deps */
'use client';

// Core
import { useContext, useEffect } from 'react';

// Context
import { LayoutContext } from '@/lib/context/global/layout.context';

// Components
import AppTopbar from '@/lib/ui/screen-components/protected/layout/super-admin-layout/app-bar';
import SuperAdminSidebar from '@/lib/ui/screen-components/protected/layout/super-admin-layout/side-bar';

// Interface
import { IProvider, LayoutContextProps } from '@/lib/utils/interfaces';

// Hooks
import { useUserContext } from '@/lib/hooks/useUser';

const Layout = ({ children }: IProvider) => {
  // Context
  const { isSuperAdminSidebarVisible } =
    useContext<LayoutContextProps>(LayoutContext);

  // Hooks
  const { user } = useUserContext();

  useEffect(() => {
    // Initialize any required setup here
    if (user) {
      console.log('Super Admin user loaded:', user);
    }
  }, [user]);

  return (
    <div className="layout-main">
      <div className="layout-top-container">
        <AppTopbar />
      </div>
      <div className="layout-main-container">
        <div className="relative left-0 z-50">
          <SuperAdminSidebar />
        </div>
        <div
          className={`h-auto max-w-[100vw] overflow-y-auto ${isSuperAdminSidebarVisible ? 'w-[calc(100vw-260px)]' : 'w-full'} px-5`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;


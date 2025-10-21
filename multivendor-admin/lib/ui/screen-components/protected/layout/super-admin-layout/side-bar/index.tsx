'use client';

// Core
import { useContext } from 'react';

// Context
import { LayoutContext } from '@/lib/context/global/layout.context';

// Interface & Types
import {
  IGlobalComponentProps,
  ISidebarMenuItem,
  LayoutContextProps,
} from '@/lib/utils/interfaces';

// Components
import SidebarItem from './side-bar-item';
import { SUPER_ADMIN_MENU_ITEMS } from '@/lib/config/menu-items';

function SuperAdminSidebar({ children }: IGlobalComponentProps) {
  // Contexts
  const { isSuperAdminSidebarVisible } =
    useContext<LayoutContextProps>(LayoutContext);

  return (
    <div className="relative">
      <aside
        id="app-sidebar"
        className={`box-border transform overflow-hidden transition-all duration-300 ease-in-out ${isSuperAdminSidebarVisible ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}`}
      >
        <nav
          className={`flex h-full flex-col border-r bg-white shadow-sm transition-opacity duration-300 ${isSuperAdminSidebarVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <ul className="flex-1 pl-2">{children}</ul>
        </nav>
      </aside>
    </div>
  );
}

export default function MakeSidebar() {
  // Contexts
  const { isSuperAdminSidebarVisible } =
    useContext<LayoutContextProps>(LayoutContext);

  return (
    <>
      <SuperAdminSidebar>
        <div className="h-[90vh] pb-4 overflow-y-auto overflow-x-hidden pr-2">
          {SUPER_ADMIN_MENU_ITEMS.map((item, index) =>
            item.shouldShow && !item.shouldShow() ? null : (
              <SidebarItem
                key={index}
                expanded={isSuperAdminSidebarVisible}
                {...item}
              />
            )
          )}
        </div>
      </SuperAdminSidebar>
    </>
  );
}


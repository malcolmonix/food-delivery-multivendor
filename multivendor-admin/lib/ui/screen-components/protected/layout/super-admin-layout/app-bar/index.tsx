/* eslint-disable @next/next/no-img-element */
'use client';

// Core
import { usePathname, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';

// Icons
import {
  faBell,
  faChevronDown,
  faEllipsisV,
  faRightFromBracket,
  faBars,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';

// Layout
import { LayoutContext } from '@/lib/context/global/layout.context';

// Hooks
import { useUserContext } from '@/lib/hooks/useUser';

// Interface/Types
import { LayoutContextProps } from '@/lib/utils/interfaces';

// Constants
import { APP_NAME } from '@/lib/utils/constants';

// Methods
import { onUseLocalStorage } from '@/lib/utils/methods';

const AppTopbar = () => {
  // States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  // Contexts
  const { showSuperAdminSidebar } = useContext<LayoutContextProps>(LayoutContext);
  const { user, setUser } = useUserContext();

  // Hooks
  const pathname = usePathname();
  const router = useRouter();

  // Handlers
  const onLogout = () => {
    onUseLocalStorage('delete', `user-${APP_NAME}`);
    setUser(null);
    router.push('/authentication/login');
  };

  const onToggleSidebar = () => {
    showSuperAdminSidebar();
  };

  return (
    <div className="layout-top-container">
      <div className="flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
        {/* Left Side - Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faBars} className="text-gray-600" />
          </button>
          
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary-color flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">
              Multivendor Admin
            </span>
          </Link>
        </div>

        {/* Center - Search (Optional) */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 text-sm focus:border-primary-color focus:outline-none focus:ring-1 focus:ring-primary-color"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <FontAwesomeIcon icon={faGlobe} className="text-gray-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Right Side - Notifications and Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100">
            <FontAwesomeIcon icon={faBell} className="text-gray-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100"
            >
              <div className="h-8 w-8 rounded-full bg-primary-color flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || 'admin@example.com'}
                </div>
              </div>
              <FontAwesomeIcon 
                icon={faChevronDown} 
                className={`text-gray-400 text-xs transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-md bg-white shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faEllipsisV} className="text-gray-400" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setIsLogoutModalVisible(true);
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FontAwesomeIcon icon={faRightFromBracket} className="text-red-400" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutModalVisible(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppTopbar;


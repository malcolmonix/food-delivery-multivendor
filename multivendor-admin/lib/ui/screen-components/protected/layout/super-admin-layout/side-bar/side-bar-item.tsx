'use client';

// Core
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Interface & Types
import { ISidebarMenuItem } from '@/lib/utils/interfaces';

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

// Constants
import { SELECTED_SIDEBAR_MENU } from '@/lib/utils/constants';

// Methods
import { onUseLocalStorage } from '@/lib/utils/methods';

interface SubMenuItemProps {
  icon?: any;
  text: string;
  active: boolean;
}

function HoveredSubMenuItem({ icon, text, active }: SubMenuItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-primary-color px-3 py-2 text-white">
      {icon && (
        <span className="card-h1 w-6">
          <FontAwesomeIcon icon={icon} />
        </span>
      )}
      <span className="card-h2 text-sm">{text}</span>
      <div className="bg-primary-200 h-1" />
    </div>
  );
}

export default function SidebarItem({
  icon,
  text,
  expanded = false,
  subMenu = null,
  route,
  isParent,
  isClickable,
  shouldOpenInNewTab,
}: ISidebarMenuItem) {
  const [expandSubMenu, setExpandSubMenu] = useState(false);

  // Hooks
  const pathname = usePathname();
  const router = useRouter();

  // use Effect
  useEffect(() => {
    if (!expanded) {
      setExpandSubMenu(false);
    }
  }, [expanded]);

  // Calculate the height of the sub-menu assuming each item is 40px tall
  const subMenuHeight = expandSubMenu
    ? `${((subMenu?.length || 0) * 41.5 + (subMenu! && 15)).toString()}px`
    : 0;

  // Defaults
  const bg_color = pathname.includes(route ?? '')
    ? isParent
      ? 'primary-color'
      : 'secondary-color'
    : '[#71717A]';

  const text_color = pathname.includes(route ?? '')
    ? isClickable
      ? 'white'
      : '[#71717A]'
    : '[#71717A]';

  const isActive = pathname.includes(route ?? '');

  return (
    <div className={`mt-[0.4rem] flex flex-col`}>
      <div>
        <button
          className={`group relative flex w-full cursor-pointer items-center rounded-md px-3 py-2 transition-colors ${
            isActive && !subMenu
              ? `bg-${isClickable ? bg_color : ''} text-${isClickable ? text_color : '[#71717A]'}`
              : `bg-${bg_color} text-${text_color} hover:bg-secondary-color`
          } ${!expanded && 'hidden sm:flex'} `}
          onClick={() => {
            if (!isParent || isClickable) {
              if (
                shouldOpenInNewTab && route
              ) {
                window.open(route, '_blank');
              } else if (
                route === 'https://hedgego.com.au/' ||
                route === 'https://hedge.net.au/become-a-stockist'
              ) {
                window.open(route, '_blank');
              } else {
                router.push(route ?? '');
              }
              return;
            }

            setExpandSubMenu((curr) => expanded && !curr);
            onUseLocalStorage('save', SELECTED_SIDEBAR_MENU, text);
          }}
        >
          {icon && (
            <span className="card-h1 w-6">
              <FontAwesomeIcon icon={icon} />
            </span>
          )}

          <span
            className={`card-h2 text-${isParent ? 'md' : 'sm'} overflow-hidden text-start transition-all ${
              expanded ? 'ml-3 w-44' : 'w-0'
            }`}
          >
            {text}
          </span>
          {subMenu && (
            <div
              className={`absolute right-2 h-4 w-4${expanded ? '' : 'top-2'} transition-all ${expandSubMenu ? 'rotate-90' : 'rotate-0'}`}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </div>
          )}

          {!expanded && (
            <div
              className="absolute left-full z-50 ml-2 hidden rounded-md bg-white p-2 shadow-lg group-hover:block"
              style={{ minWidth: '200px' }}
            >
              <HoveredSubMenuItem
                icon={icon}
                text={text}
                active={isActive}
              />
            </div>
          )}
        </button>
      </div>

      {/* Sub Menu */}
      {subMenu && expanded && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ height: subMenuHeight }}
        >
          <div className="ml-6 mt-2 space-y-1">
            {subMenu.map((subItem, subIndex) => (
              <button
                key={subIndex}
                className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname.includes(subItem.route ?? '')
                    ? 'bg-secondary-color text-primary-color'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => {
                  router.push(subItem.route ?? '');
                }}
              >
                <span className="overflow-hidden text-start">
                  {subItem.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


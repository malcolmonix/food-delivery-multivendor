import { ISidebarMenuItem } from '@/lib/utils/interfaces';
import {
  faCog,
  faHome,
  faSliders,
  faWallet,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';

export const SUPER_ADMIN_MENU_ITEMS: ISidebarMenuItem[] = [
  {
    text: 'Home',
    label: 'Home',
    route: '/dashboard',
    isParent: true,
    icon: faHome,
    isClickable: true,
  },
  {
    text: 'General',
    label: 'General',
    route: '/general',
    isParent: true,
    icon: faCog,
    subMenu: [
      {
        text: 'Vendors',
        label: 'Vendors',
        route: '/general/vendors',
        isParent: false,
      },
      {
        text: 'Stores',
        label: 'Stores',
        route: '/general/stores',
        isParent: false,
      },
      {
        text: 'Riders',
        label: 'Riders',
        route: '/general/riders',
        isParent: false,
      },
      {
        text: 'Users',
        label: 'Users',
        route: '/general/users',
        isParent: false,
      },
      {
        text: 'Staff',
        label: 'Staff',
        route: '/general/staff',
        isParent: false,
      },
    ],
    shouldShow: function () {
      return this.subMenu ? this.subMenu.length > 0 : false;
    },
  },
  {
    text: 'Management',
    label: 'Management',
    route: '/management',
    isParent: true,
    icon: faSliders,
    subMenu: [
      {
        text: 'Configuration',
        label: 'Configuration',
        route: '/management/configurations',
        isParent: false,
      },
      {
        text: 'Orders',
        label: 'Orders',
        route: '/management/orders',
        isParent: false,
      },
      {
        text: 'Coupons',
        label: 'Coupons',
        route: '/management/coupons',
        isParent: false,
      },
      {
        text: 'Cuisine',
        label: 'Cuisine',
        route: '/management/cuisines',
        isParent: false,
      },
      {
        text: 'Shop Type',
        label: 'Shop Type',
        route: '/management/shop-types',
        isParent: false,
      },
      {
        text: 'Banners',
        label: 'Banners',
        route: '/management/banners',
        isParent: false,
      },
      {
        text: 'Tipping',
        label: 'Tipping',
        route: '/management/tippings',
        isParent: false,
      },
      {
        text: 'Commission Rate',
        label: 'Commission Rate',
        route: '/management/commission-rates',
        isParent: false,
      },
      {
        text: 'Notification',
        label: 'Notification',
        route: '/management/notifications',
        isParent: false,
      },
      {
        text: 'Audit Logs',
        label: 'Audit Logs',
        route: '/management/audit-logs',
        isParent: false,
      },
    ],
    shouldShow: function () {
      return this.subMenu ? this.subMenu.length > 0 : false;
    },
  },
  {
    text: 'Wallet',
    label: 'Wallet',
    route: '/wallet',
    isParent: true,
    icon: faWallet,
    subMenu: [
      {
        text: 'Transaction History',
        label: 'Transaction History',
        route: '/wallet/transaction-history',
        isParent: false,
      },
      {
        text: 'Withdrawal Request',
        label: 'Withdrawal Request',
        route: '/wallet/withdraw-requests',
        isParent: false,
      },
      {
        text: 'Earnings',
        label: 'Earnings',
        route: '/wallet/earnings',
        isParent: false,
      },
    ],
    shouldShow: function () {
      return this.subMenu ? this.subMenu.length > 0 : false;
    },
  },
  {
    text: 'CustomerSupport',
    label: 'Customer Support',
    route: '/customer-support',
    icon: faHeadset,
    isClickable: true,
    isParent: true,
  },
];


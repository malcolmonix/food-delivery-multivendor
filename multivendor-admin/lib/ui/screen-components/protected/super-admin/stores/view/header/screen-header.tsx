'use client';

import { useContext } from 'react';
import { useTranslations } from 'next-intl';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';

export default function StoresScreenHeader() {
  const t = useTranslations();
  const { onRestaurantsFormVisible } = useContext(RestaurantsContext);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Stores')}</h1>
          <p className="text-gray-600 mt-2">
            {t('Manage store accounts and their operations')}
          </p>
        </div>
        <button
          onClick={() => onRestaurantsFormVisible(true)}
          className="bg-primary-color text-white px-4 py-2 rounded-md hover:bg-primary-color/90 transition-colors"
        >
          {t('Add Store')}
        </button>
      </div>
    </div>
  );
}
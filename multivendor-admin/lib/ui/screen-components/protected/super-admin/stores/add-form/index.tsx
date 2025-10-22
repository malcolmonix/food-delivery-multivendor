'use client';

import { useContext } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { useTranslations } from 'next-intl';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';

export default function StoresForm() {
  const t = useTranslations();
  const { isRestaurantsFormVisible, onRestaurantsFormVisible } = useContext(RestaurantsContext);

  return (
    <Sidebar
      visible={isRestaurantsFormVisible}
      position="right"
      onHide={() => onRestaurantsFormVisible(false)}
      className="w-full sm:w-[600px]"
    >
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">{t('Add Store')}</h2>
        <p>{t('Store form coming soon...')}</p>
      </div>
    </Sidebar>
  );
}
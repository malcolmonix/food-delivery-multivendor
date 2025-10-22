'use client';

import { useContext } from 'react';
import { useTranslations } from 'next-intl';
import { TabView, TabPanel } from 'primereact/tabview';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';
import { RESTAURANTS_TABS } from '@/lib/utils/constants';

export default function StoresScreenSubHeader() {
  const t = useTranslations();
  const { currentTab, onSetCurrentTab } = useContext(RestaurantsContext);

  return (
    <div className="mb-6">
      <TabView
        activeIndex={RESTAURANTS_TABS.indexOf(currentTab)}
        onTabChange={(e) => onSetCurrentTab(RESTAURANTS_TABS[e.index])}
      >
        {RESTAURANTS_TABS.map((tab) => (
          <TabPanel key={tab} header={t(tab)} />
        ))}
      </TabView>
    </div>
  );
}
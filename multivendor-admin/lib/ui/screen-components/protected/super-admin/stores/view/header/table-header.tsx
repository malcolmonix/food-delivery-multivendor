'use client';

import { InputText } from 'primereact/inputtext';
import { useTranslations } from 'next-intl';

interface StoresTableHeaderProps {
  globalFilterValue: string;
  setGlobalFilterValue: (value: string) => void;
  selectedActions: string[];
  setSelectedActions: (actions: string[]) => void;
}

export default function StoresTableHeader({
  globalFilterValue,
  setGlobalFilterValue,
}: StoresTableHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex justify-between items-center mb-4">
      <span className="text-xl font-semibold">{t('Stores')}</span>
      <div className="flex gap-4">
        <InputText
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          placeholder={t('Search stores...')}
          className="p-inputtext-sm"
        />
      </div>
    </div>
  );
}
'use client';

import { useContext } from 'react';
import { useTranslations } from 'next-intl';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { IDropdownSelectItem } from '@/lib/utils/interfaces';

interface UsersHeaderProps {
  search: string;
  setSearch: (search: string) => void;
  registrationMethodFilter: IDropdownSelectItem[];
  setRegistrationMethodFilter: (filter: IDropdownSelectItem[]) => void;
  accountStatusFilter: IDropdownSelectItem[];
  setAccountStatusFilter: (filter: IDropdownSelectItem[]) => void;
  onAddUser: () => void;
}

export default function UsersHeader({
  search,
  setSearch,
  onAddUser,
}: UsersHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border-b">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('Users')}</h1>
        <Button
          label={t('Add User')}
          icon="pi pi-plus"
          onClick={onAddUser}
        />
      </div>
      <div className="flex gap-4">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('Search users...')}
          className="p-inputtext-sm"
        />
      </div>
    </div>
  );
}
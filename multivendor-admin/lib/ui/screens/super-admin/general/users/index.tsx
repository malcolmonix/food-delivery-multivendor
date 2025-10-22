'use client';
import { useState } from 'react';
import UsersHeader from '@/lib/ui/screen-components/protected/super-admin/users/view/header/screen-header';
import UsersMain from '@/lib/ui/screen-components/protected/super-admin/users/view/main';
import UsersForm from '@/lib/ui/screen-components/protected/super-admin/users/add-form';
import useDebounce from '@/lib/hooks/useDebounce';
import { IDropdownSelectItem } from '@/lib/utils/interfaces';

export default function UsersScreen() {
  const [search, setSearch] = useState('');
  const [registrationMethodFilter, setRegistrationMethodFilter] = useState<IDropdownSelectItem[]>([]);
  const [accountStatusFilter, setAccountStatusFilter] = useState<IDropdownSelectItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 500);

  const handleAddUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="flex h-[90vh] flex-col overflow-auto">
      <UsersHeader
        search={search}
        setSearch={setSearch}
        registrationMethodFilter={registrationMethodFilter}
        setRegistrationMethodFilter={setRegistrationMethodFilter}
        accountStatusFilter={accountStatusFilter}
        setAccountStatusFilter={setAccountStatusFilter}
        onAddUser={handleAddUser}
      />

      <UsersMain
        debouncedSearch={debouncedSearch}
        registrationMethodFilter={registrationMethodFilter}
        accountStatusFilter={accountStatusFilter}
        onEditUser={handleEditUser}
      />

      <UsersForm
        visible={showForm}
        onHide={handleCloseForm}
        editingUser={editingUser}
      />
    </div>
  );
}
'use client';

import React, { useState, useMemo, useContext } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { ToastContext } from '@/lib/context/global/toast.context';
import { IDropdownSelectItem } from '@/lib/utils/interfaces';
import { GET_USERS, DELETE_USER } from '@/lib/api/graphql';

interface UsersMainProps {
  debouncedSearch: string;
  registrationMethodFilter: IDropdownSelectItem[];
  accountStatusFilter: IDropdownSelectItem[];
  onEditUser: (user: IUserResponse) => void;
}

interface IUserResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  status: string;
  createdAt: string;
}

export default function UsersMain({
  debouncedSearch,
  registrationMethodFilter = [],
  accountStatusFilter = [],
  onEditUser,
}: UsersMainProps) {
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deleteId, setDeleteId] = useState('');

  const { data, loading, refetch } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
  });

  const [deleteUser, { loading: isDeleting }] = useMutation(DELETE_USER, {
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('User Delete'),
        message: t('User has been deleted successfully'),
        duration: 2000,
      });
      setDeleteId('');
      refetch();
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: t('User Delete'),
        message: error.message || t('User delete failed'),
        duration: 2500,
      });
      setDeleteId('');
    },
  });

  const allUsers: IUserResponse[] = useMemo(() => data?.users ?? [], [data]);

  const filteredUsers = useMemo(() => {
    let currentUsers = allUsers;

    if (debouncedSearch) {
      currentUsers = currentUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (registrationMethodFilter.length > 0) {
      currentUsers = currentUsers.filter((user) =>
        registrationMethodFilter.flatMap(item => item.code).includes(user.userType)
      );
    }

    if (accountStatusFilter.length > 0) {
      currentUsers = currentUsers.filter((user) =>
        accountStatusFilter?.flatMap(item => item.code).includes(user.status)
      );
    }

    return currentUsers;
  }, [allUsers, debouncedSearch, registrationMethodFilter, accountStatusFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, limit]);

  const totalFilteredUsers = filteredUsers.length;

  const handleDelete = (id: string) => {
    deleteUser({ variables: { id } });
  };

  return (
    <div className="p-4">
      {loading ? (
        <p>{t('Loading...')}</p>
      ) : (
        <div className="space-y-4">
          {paginatedUsers.map((user: IUserResponse) => (
            <div key={user._id} className="border p-4 rounded bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{user.name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.phone}</p>
                  <p className="text-sm text-gray-500">{user.userType} - {user.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditUser(user)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    {t('Edit')}
                  </button>
                  <button
                    onClick={() => setDeleteId(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    {t('Delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          {t('Showing')} {paginatedUsers.length} {t('of')} {totalFilteredUsers} {t('users')}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {t('Previous')}
          </button>
          <span>{currentPage}</span>
          <button
            onClick={() => setCurrentPage(Math.min(Math.ceil(totalFilteredUsers / limit), currentPage + 1))}
            disabled={currentPage >= Math.ceil(totalFilteredUsers / limit)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            {t('Next')}
          </button>
        </div>
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded">
            <p>{t('Are you sure you want to delete this user?')}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {isDeleting ? t('Deleting...') : t('Delete')}
              </button>
              <button
                onClick={() => setDeleteId('')}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                {t('Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
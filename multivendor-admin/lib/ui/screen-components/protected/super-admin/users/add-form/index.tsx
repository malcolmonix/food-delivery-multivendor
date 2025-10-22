'use client';

import React, { useState, useContext } from 'react';
import { useMutation } from '@apollo/client';
import { useTranslations } from 'next-intl';
import { ToastContext } from '@/lib/context/global/toast.context';
import { CREATE_USER, EDIT_USER } from '@/lib/api/graphql';

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  userType: string;
  status: string;
}

interface UsersFormProps {
  visible: boolean;
  onHide: () => void;
  editingUser?: any;
}

export default function UsersForm({ visible, onHide, editingUser }: UsersFormProps) {
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);
  const [formData, setFormData] = useState<UserFormData>({
    name: editingUser?.name || '',
    email: editingUser?.email || '',
    phone: editingUser?.phone || '',
    userType: editingUser?.userType || 'CUSTOMER',
    status: editingUser?.status || 'ACTIVE',
  });

  // Update form data when editingUser changes
  React.useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        email: editingUser.email || '',
        phone: editingUser.phone || '',
        userType: editingUser.userType || 'CUSTOMER',
        status: editingUser.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'CUSTOMER',
        status: 'ACTIVE',
      });
    }
  }, [editingUser]);

  const [createUser, { loading: isCreating }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('User Created'),
        message: t('User has been created successfully'),
        duration: 2000,
      });
      onHide();
      setFormData({
        name: '',
        email: '',
        phone: '',
        userType: 'CUSTOMER',
        status: 'ACTIVE',
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: t('User Creation Failed'),
        message: error.message || t('Failed to create user'),
        duration: 2500,
      });
    },
  });

  const [editUser, { loading: isEditing }] = useMutation(EDIT_USER, {
    onCompleted: () => {
      showToast({
        type: 'success',
        title: t('User Updated'),
        message: t('User has been updated successfully'),
        duration: 2000,
      });
      onHide();
    },
    onError: (error) => {
      showToast({
        type: 'error',
        title: t('User Update Failed'),
        message: error.message || t('Failed to update user'),
        duration: 2500,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      editUser({
        variables: {
          userInput: {
            ...formData,
            _id: editingUser._id,
          },
        },
      });
    } else {
      createUser({
        variables: {
          userInput: formData,
        },
      });
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editingUser ? t('Edit User') : t('Add User')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('Name')}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('Email')}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('Phone')}</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('User Type')}</label>
            <select
              value={formData.userType}
              onChange={(e) => handleChange('userType', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor</option>
              <option value="RIDER">Rider</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('Status')}</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isCreating || isEditing}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isCreating || isEditing ? t('Saving...') : (editingUser ? t('Update') : t('Create'))}
            </button>
            <button
              type="button"
              onClick={onHide}
              className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
            >
              {t('Cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
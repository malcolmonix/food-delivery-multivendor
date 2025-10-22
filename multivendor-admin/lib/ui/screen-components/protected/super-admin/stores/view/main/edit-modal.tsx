'use client';

import { useState } from 'react';
import { IRestaurantResponse } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';

interface EditStoreModalProps {
  store: IRestaurantResponse;
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: any) => Promise<void>;
  isLoading: boolean;
}

export default function EditStoreModal({ store, isOpen, onClose, onSave, isLoading }: EditStoreModalProps) {
  const t = useTranslations();
  
  const [formData, setFormData] = useState({
    _id: store._id,
    name: store.name || '',
    address: store.address || '',
    phone: (store as any).phone || '',
    image: store.image || '',
    deliveryTime: store.deliveryTime || '',
    minimumOrder: store.minimumOrder || 0,
    commissionRate: store.commissionRate || 0,
    tax: store.tax || 0,
    isActive: store.isActive !== false,
    shopType: store.shopType || 'restaurant',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">{t('Edit Store')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Address')} *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Phone')}
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Image URL')}
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Delivery Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Delivery Time')}
                </label>
                <input
                  type="text"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  placeholder="25-35 min"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Minimum Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Minimum Order')}
                </label>
                <input
                  type="number"
                  name="minimumOrder"
                  value={formData.minimumOrder}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Commission Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Commission Rate')} (%)
                </label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Tax */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Tax')} (%)
                </label>
                <input
                  type="number"
                  name="tax"
                  value={formData.tax}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Shop Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('Shop Type')}
                </label>
                <select
                  name="shopType"
                  value={formData.shopType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="restaurant">{t('Restaurant')}</option>
                  <option value="grocery">{t('Grocery')}</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">{t('Active')}</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? t('Saving...') : t('Save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

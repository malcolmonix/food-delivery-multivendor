'use client';

import { IRestaurantResponse } from '@/lib/utils/interfaces';
import { useTranslations } from 'next-intl';

interface ViewStoreModalProps {
  store: IRestaurantResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewStoreModal({ store, isOpen, onClose }: ViewStoreModalProps) {
  const t = useTranslations();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{t('Store Details')}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Image */}
            {store.image && (
              <div>
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label={t('Name')} value={store.name} />
              <InfoField label={t('Address')} value={store.address} />
              <InfoField label={t('Phone')} value={(store as any).phone || '-'} />
              <InfoField label={t('Slug')} value={store.slug || '-'} />
              <InfoField label={t('Order Prefix')} value={store.orderPrefix || '-'} />
              <InfoField label={t('Unique ID')} value={store.unique_restaurant_id || '-'} />
            </div>

            {/* Business Info */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">{t('Business Information')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label={t('Shop Type')} value={store.shopType || 'restaurant'} />
                <InfoField label={t('Delivery Time')} value={store.deliveryTime || '-'} />
                <InfoField
                  label={t('Minimum Order')}
                  value={store.minimumOrder !== undefined ? `$${store.minimumOrder}` : '-'}
                />
                <InfoField
                  label={t('Commission Rate')}
                  value={store.commissionRate !== undefined ? `${store.commissionRate}%` : '-'}
                />
                <InfoField
                  label={t('Tax')}
                  value={store.tax !== undefined ? `${store.tax}%` : '-'}
                />
                <InfoField label={t('Username')} value={store.username || '-'} />
              </div>
            </div>

            {/* Status */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">{t('Status')}</h3>
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {store.isActive ? t('Active') : t('Inactive')}
                </span>
              </div>
            </div>

            {/* Owner Info */}
            {store.owner && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">{t('Owner Information')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label={t('Owner ID')} value={store.owner._id || '-'} />
                  <InfoField label={t('Owner Email')} value={store.owner.email || '-'} />
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      store.owner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {store.owner.isActive ? t('Owner Active') : t('Owner Inactive')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              {t('Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
}

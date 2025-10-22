'use client';

import { useContext, useEffect, useState } from 'react';
import { ApolloError, useMutation } from '@apollo/client';
import { ToastContext } from '@/lib/context/global/toast.context';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useDebounce from '@/lib/hooks/useDebounce';
import {
  IQueryResult,
  IRestaurantResponse,
  IRestaurantsResponseGraphQL,
} from '@/lib/utils/interfaces';
import {
  GET_RESTAURANTS_PAGINATED,
  HARD_DELETE_RESTAURANT,
} from '@/lib/api/graphql';
import { UPDATE_RESTAURANT, DELETE_RESTAURANT_SOFT } from '@/lib/api/graphql/mutations/restaurants/crud';
import { useTranslations } from 'next-intl';
import EditStoreModal from './edit-modal';
import ViewStoreModal from './view-modal';

export default function StoresMain() {
  const t = useTranslations();
  const { showToast } = useContext(ToastContext);

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState('');
  const [editStore, setEditStore] = useState<IRestaurantResponse | null>(null);
  const [viewStore, setViewStore] = useState<IRestaurantResponse | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  const debouncedSearchTerm = useDebounce(globalFilterValue, 500);

  const queryVariables = {
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearchTerm || undefined,
  };

  const { data, loading, refetch } = useQueryGQL(
    GET_RESTAURANTS_PAGINATED,
    queryVariables,
    { fetchPolicy: 'cache-and-network', debounceMs: 300 }
  ) as IQueryResult<IRestaurantsResponseGraphQL | undefined, undefined>;

  // Mutations
  const [hardDeleteRestaurant, { loading: isHardDeleting }] = useMutation(
    HARD_DELETE_RESTAURANT,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Store Delete'),
          message: t(`Store deleted successfully`),
          duration: 2000,
        });
        setDeleteId('');
        refetch();
      },
      onError: ({ graphQLErrors, networkError }: ApolloError) => {
        showToast({
          type: 'error',
          title: t('Store Delete'),
          message: graphQLErrors[0]?.message ?? networkError?.message ?? t(`Delete failed`),
          duration: 2500,
        });
        setDeleteId('');
      },
    }
  );

  const [updateRestaurant, { loading: isUpdating }] = useMutation(
    UPDATE_RESTAURANT,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Store Update'),
          message: t(`Store updated successfully`),
          duration: 2000,
        });
        setEditStore(null);
        refetch();
      },
      onError: ({ graphQLErrors, networkError }: ApolloError) => {
        showToast({
          type: 'error',
          title: t('Store Update'),
          message: graphQLErrors[0]?.message ?? networkError?.message ?? t(`Update failed`),
          duration: 2500,
        });
      },
    }
  );

  const handleDelete = async (id: string) => {
    await hardDeleteRestaurant({ variables: { id } });
  };

  const handleUpdate = async (input: any) => {
    await updateRestaurant({ variables: { input } });
  };

  const restaurantData = data?.restaurantsPaginated;
  const restaurants = restaurantData?.data || [];
  const totalPages = restaurantData?.totalPages || 1;

  // Toggle isActive for a restaurant
  const handleToggleActive = async (restaurant: IRestaurantResponse) => {
    await updateRestaurant({
      variables: {
        input: {
          _id: restaurant._id,
          isActive: !restaurant.isActive,
        },
      },
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('Stores')}</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          {t('Add Store')}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          placeholder={t('Search stores...')}
          className="w-full max-w-md p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <p>{t('Loading...')}</p>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Address')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Phone')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants.map((restaurant: IRestaurantResponse) => (
                  <tr key={restaurant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.image && (
                          <img src={restaurant.image} alt={restaurant.name} className="h-10 w-10 rounded-full mr-3" />
                        )}
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{restaurant.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{restaurant.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {restaurant.isActive ? t('Active') : t('Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setViewStore(restaurant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {t('View')}
                      </button>
                      <button
                        onClick={() => setEditStore(restaurant)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {t('Edit')}
                      </button>
                      <button
                        onClick={() => setDeleteId(restaurant._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('Delete')}
                      </button>
                      <button
                        onClick={() => handleToggleActive(restaurant)}
                        className={restaurant.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-400'}
                        disabled={isUpdating}
                      >
                        {restaurant.isActive ? t('Disable') : t('Enable')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div>
              {t('Page')} {currentPage} {t('of')} {totalPages}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                {t('Previous')}
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                {t('Next')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md">
            <h3 className="text-lg font-bold mb-4">{t('Delete Store')}</h3>
            <p className="mb-6">{t('Are you sure you want to delete this store? This action cannot be undone.')}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteId('')}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isHardDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isHardDeleting ? t('Deleting...') : t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editStore && (
        <EditStoreModal
          store={editStore}
          isOpen={!!editStore}
          onClose={() => setEditStore(null)}
          onSave={handleUpdate}
          isLoading={isUpdating}
        />
      )}

      {/* View Modal */}
      {viewStore && (
        <ViewStoreModal
          store={viewStore}
          isOpen={!!viewStore}
          onClose={() => setViewStore(null)}
        />
      )}
    </div>
  );
}

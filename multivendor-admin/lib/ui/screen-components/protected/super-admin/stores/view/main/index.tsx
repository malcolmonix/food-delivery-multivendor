'use client';

// Core
import { useContext, useEffect, useState } from 'react';
import { ApolloError, useMutation } from '@apollo/client';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';

// Custom Hooks
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import useDebounce from '@/lib/hooks/useDebounce';

// Constants and Interfaces
import {
  IActionMenuItem,
  IQueryResult,
  IRestaurantResponse,
  IRestaurantsResponseGraphQL,
} from '@/lib/utils/interfaces';

// GraphQL Queries and Mutations
import {
  GET_RESTAURANTS_PAGINATED,
  HARD_DELETE_RESTAURANT,
} from '@/lib/api/graphql';

// Method
import { onUseLocalStorage } from '@/lib/utils/methods';

// Dummy
import { useTranslations } from 'next-intl';

export default function StoresMain() {
  // Hooks
  const t = useTranslations();

  // Context
  const { showToast } = useContext(ToastContext);

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState('');
  const [globalFilterValue, setGlobalFilterValue] = useState('');

  // Debounce search to avoid too many API calls
  const debouncedSearchTerm = useDebounce(globalFilterValue, 500);

  // Query variables
  const queryVariables = {
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearchTerm || undefined,
  };

  //Query
  const { data, loading, refetch } = useQueryGQL(
    GET_RESTAURANTS_PAGINATED,
    queryVariables,
    {
      fetchPolicy: 'cache-and-network',
      debounceMs: 300,
    }
  ) as IQueryResult<IRestaurantsResponseGraphQL | undefined, undefined>;

  useEffect(() => {
    console.log("🚀 Stores Screen Rendered");
  });

  // API
  const [hardDeleteRestaurant, { loading: isHardDeleting }] = useMutation(
    HARD_DELETE_RESTAURANT,
    {
      onCompleted: () => {
        showToast({
          type: 'success',
          title: t('Store Delete'),
          message: t(`Store has been deleted successfully`),
          duration: 2000,
        });
        setDeleteId('');
        // Refetch data after deletion
        refetch();
      },
      onError: ({ networkError, graphQLErrors }: ApolloError) => {
        showToast({
          type: 'error',
          title: t('Store Delete'),
          message:
            graphQLErrors[0]?.message ??
            networkError?.message ??
            t(`Store delete failed`),
          duration: 2500,
        });
        setDeleteId('');
      },
    }
  );

  const handleDelete = async (id: string) => {
    try {
      await hardDeleteRestaurant({ variables: { id: id } });
    } catch (err) {
      showToast({
        type: 'error',
        title: t('Store Delete'),
        message: t(`Store delete failed`),
      });
      setDeleteId('');
    }
  };

  // Get pagination data
  const restaurantData = data?.restaurantsPaginated;
  const restaurants = restaurantData?.data || [];

  return (
    <div className="p-3">
      <div className="mb-4">
        <input
          type="text"
          value={globalFilterValue}
          onChange={(e) => setGlobalFilterValue(e.target.value)}
          placeholder={t('Search stores...')}
          className="p-2 border rounded"
        />
      </div>

      {loading ? (
        <p>{t('Loading...')}</p>
      ) : (
        <div className="space-y-4">
          {restaurants.map((restaurant: IRestaurantResponse) => (
            <div key={restaurant._id} className="border p-4 rounded">
              <h3 className="font-bold">{restaurant.name}</h3>
              <p>{restaurant.address}</p>
              <p>{restaurant.owner?.email}</p>
              <button
                onClick={() => setDeleteId(restaurant._id)}
                className="bg-red-500 text-white px-2 py-1 rounded mt-2"
              >
                {t('Delete')}
              </button>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <p>{t('Are you sure you want to delete this store?')}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isHardDeleting}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {isHardDeleting ? t('Deleting...') : t('Delete')}
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
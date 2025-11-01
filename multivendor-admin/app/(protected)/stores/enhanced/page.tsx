"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Restaurant, restaurantService } from '@/lib/services/restaurant.service';
import { ensureAdminAuth } from '@/lib/firebase/menuverse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye, 
  faStore,
  faMapMarkerAlt,
  faPhone,
  faStar,
  faToggleOn,
  faToggleOff,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

export default function EnhancedStoresPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  
  // Bulk operations state
  const [selectedRestaurants, setSelectedRestaurants] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    // Simplified auth check - skip complex admin auth for now
    const checkAuth = () => {
      // For development, allow access and load data immediately
      setIsAuthenticating(false);
    };

    checkAuth();
  }, [router]);

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo purposes, create some sample data if none exists
      let data = await restaurantService.getAllRestaurants();
      
      if (data.length === 0) {
        // Create sample restaurant for demo
        console.log('No restaurants found, this would typically be handled by the create restaurant flow');
        setRestaurants([]);
      } else {
        setRestaurants(data);
      }
    } catch (err: any) {
      console.error('Restaurant loading error:', err);
      setError(err.message || 'Failed to load restaurants');
      // Show empty state instead of blocking
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticating) return;

    loadRestaurants();

    // Set up real-time subscription
    try {
      const unsubscribe = restaurantService.subscribeToRestaurants((data) => {
        setRestaurants(data);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to set up real-time subscription:', error);
    }
  }, [isAuthenticating]);

  const filteredRestaurants = useMemo(() => {
    if (!searchQuery) return restaurants;
    
    const query = searchQuery.toLowerCase();
    return restaurants.filter(restaurant => 
      (restaurant.name || '').toLowerCase().includes(query) ||
      (restaurant.address || '').toLowerCase().includes(query) ||
      (restaurant.cuisineType || []).some(cuisine => cuisine.toLowerCase().includes(query)) ||
      (restaurant.phone || '').toLowerCase().includes(query)
    );
  }, [restaurants, searchQuery]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await restaurantService.updateRestaurant(id, { isActive: !currentStatus });
    } catch (error) {
      console.error('Failed to update restaurant status:', error);
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      await restaurantService.deleteRestaurant(id);
    } catch (error) {
      console.error('Failed to delete restaurant:', error);
    }
  };

  // Bulk operations
  const handleSelectRestaurant = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRestaurants);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRestaurants(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredRestaurants.map(r => r.id));
      setSelectedRestaurants(allIds);
    } else {
      setSelectedRestaurants(new Set());
    }
  };

  const handleBulkActivate = async (activate: boolean) => {
    if (selectedRestaurants.size === 0) return;
    
    setBulkActionLoading(true);
    const action = activate ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} ${selectedRestaurants.size} restaurant(s)?`)) {
      setBulkActionLoading(false);
      return;
    }

    try {
      const promises = Array.from(selectedRestaurants).map(id =>
        restaurantService.updateRestaurant(id, { isActive: activate })
      );
      await Promise.all(promises);
      setSelectedRestaurants(new Set());
      await loadRestaurants(); // Reload data
    } catch (error) {
      console.error(`Failed to ${action} restaurants:`, error);
      setError(`Failed to ${action} restaurants`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRestaurants.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const promises = Array.from(selectedRestaurants).map(id =>
        restaurantService.deleteRestaurant(id)
      );
      await Promise.all(promises);
      setSelectedRestaurants(new Set());
      setShowBulkDeleteModal(false);
      await loadRestaurants(); // Reload data
    } catch (error) {
      console.error('Failed to delete restaurants:', error);
      setError('Failed to delete restaurants');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (isAuthenticating) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faStore} className="text-orange-500" />
            Restaurant Management
          </h1>
          <p className="text-gray-600 mt-2">Manage restaurants connected to MenuVerse</p>
        </div>
        
        <button
          onClick={() => router.push('/stores/create')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Restaurant
        </button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{restaurants.length}</div>
          <div className="text-sm text-gray-600">Total Restaurants</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {restaurants.filter(r => r.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Restaurants</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {restaurants.length > 0 ? 
              (restaurants.reduce((sum, r) => sum + (r.rating || 0), 0) / restaurants.filter(r => r.rating).length || 0).toFixed(1) : 
              '0.0'
            }
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedRestaurants.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 font-medium">
                {selectedRestaurants.size} restaurant(s) selected
              </span>
              <button
                onClick={() => setSelectedRestaurants(new Set())}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkActivate(true)}
                disabled={bulkActionLoading}
                className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors ${
                  bulkActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FontAwesomeIcon icon={faToggleOn} className="mr-2" />
                Activate
              </button>
              
              <button
                onClick={() => handleBulkActivate(false)}
                disabled={bulkActionLoading}
                className={`px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition-colors ${
                  bulkActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FontAwesomeIcon icon={faToggleOff} className="mr-2" />
                Deactivate
              </button>
              
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                disabled={bulkActionLoading}
                className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors ${
                  bulkActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading restaurants...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Restaurants Grid */}
      {!loading && !error && (
        <>
          {/* Select All Checkbox */}
          {filteredRestaurants.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedRestaurants.size === filteredRestaurants.length && filteredRestaurants.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select all restaurants ({filteredRestaurants.length})
                </span>
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedRestaurants.has(restaurant.id)}
                    onChange={(e) => handleSelectRestaurant(restaurant.id, e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 bg-white shadow-sm"
                  />
                </div>

                {/* Restaurant Image */}
                <div className="relative h-48 bg-gray-200">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FontAwesomeIcon icon={faStore} className="text-4xl text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{restaurant.name}</h3>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400" />
                    <span className="truncate">{restaurant.address || 'No address provided'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                    <span>{restaurant.phone || 'No phone provided'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
                    <span>
                      {restaurant.rating ? restaurant.rating.toFixed(1) : 'No rating'} 
                      ({restaurant.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Cuisine Types */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {(restaurant.cuisineType || []).slice(0, 2).map((cuisine, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                    >
                      {cuisine}
                    </span>
                  ))}
                  {(restaurant.cuisineType || []).length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{(restaurant.cuisineType || []).length - 2} more
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRestaurant(restaurant)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    
                    <button
                      onClick={() => router.push(`/stores/${restaurant.id}/edit`)}
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Edit Restaurant"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Restaurant"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleToggleActive(restaurant.id, restaurant.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      restaurant.isActive 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    title={restaurant.isActive ? 'Deactivate' : 'Activate'}
                  >
                    <FontAwesomeIcon icon={restaurant.isActive ? faToggleOn : faToggleOff} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && filteredRestaurants.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faStore} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No restaurants found' : 'No restaurants yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'Get started by adding your first restaurant'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push('/stores/create')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Restaurant
            </button>
          )}
        </div>
      )}

      {/* Restaurant Details Modal */}
      {selectedRestaurant && (
        <RestaurantDetailsModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Multiple Restaurants</h3>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{selectedRestaurants.size}</strong> restaurant(s)? 
              This action cannot be undone and will permanently remove all associated data.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={bulkActionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors ${
                  bulkActionLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {bulkActionLoading ? 'Deleting...' : `Delete ${selectedRestaurants.size} Restaurant(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Restaurant Details Modal Component
function RestaurantDetailsModal({ 
  restaurant, 
  onClose 
}: { 
  restaurant: Restaurant; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Restaurant Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{restaurant.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{restaurant.phone}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{restaurant.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className={`font-medium ${restaurant.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Address</h3>
              <p className="text-sm text-gray-600">{restaurant.address}</p>
            </div>

            {/* Delivery Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Delivery Information</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Delivery Fee:</span>
                  <p className="font-medium">₦{restaurant.deliveryFee}</p>
                </div>
                <div>
                  <span className="text-gray-600">Min Order:</span>
                  <p className="font-medium">₦{restaurant.minimumOrder}</p>
                </div>
                <div>
                  <span className="text-gray-600">Delivery Time:</span>
                  <p className="font-medium">{restaurant.estimatedDeliveryTime}</p>
                </div>
              </div>
            </div>

            {/* Cuisine Types */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Cuisine Types</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisineType.map((cuisine, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


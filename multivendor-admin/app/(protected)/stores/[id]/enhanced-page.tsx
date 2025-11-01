"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Restaurant, restaurantService } from '@/lib/services/restaurant.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft,
  faEdit,
  faTrash,
  faToggleOn,
  faToggleOff,
  faStore,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faStar,
  faClock,
  faDollarSign,
  faUtensils,
  faUsers,
  faChartLine,
  faCalendarAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

export default function RestaurantDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const restaurantId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      loadRestaurant();
    }
  }, [restaurantId]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurantById(restaurantId);
      setRestaurant(data);
    } catch (err: any) {
      setError(`Failed to load restaurant: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!restaurant) return;
    
    try {
      setActionLoading(true);
      await restaurantService.updateRestaurant(restaurant.id, { 
        isActive: !restaurant.isActive 
      });
      await loadRestaurant(); // Reload to get updated data
    } catch (err: any) {
      setError(`Failed to update restaurant status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!restaurant) return;
    
    try {
      setActionLoading(true);
      await restaurantService.deleteRestaurant(restaurant.id);
      router.push('/stores');
    } catch (err: any) {
      setError(`Failed to delete restaurant: ${err.message}`);
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/stores')}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">Restaurant not found</p>
        <button
          onClick={() => router.push('/stores')}
          className="mt-2 text-yellow-600 hover:text-yellow-800 underline"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  const formatTime = (time: string) => {
    return time || 'Not specified';
  };

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/stores')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            <p className="text-gray-600">{restaurant.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleActive}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              restaurant.isActive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FontAwesomeIcon 
              icon={restaurant.isActive ? faToggleOn : faToggleOff} 
              className="mr-2" 
            />
            {restaurant.isActive ? 'Active' : 'Inactive'}
          </button>

          <button
            onClick={() => router.push(`/stores/${restaurant.id}/edit`)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Edit
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Restaurant Image */}
      {restaurant.image && (
        <div className="rounded-lg overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faStore} className="text-orange-500" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-400 w-5" />
                <span>{restaurant.address || 'No address provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-gray-400 w-5" />
                <span>{restaurant.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-5" />
                <span>{restaurant.email || 'No email provided'}</span>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faDollarSign} className="text-green-500" />
              Business Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Fee</label>
                <p className="text-lg">${restaurant.deliveryFee?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Minimum Order</label>
                <p className="text-lg">${restaurant.minimumOrder?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Radius</label>
                <p className="text-lg">{restaurant.deliveryRadius || 0} km</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Delivery Time</label>
                <p className="text-lg">{restaurant.estimatedDeliveryTime || 'Not specified'}</p>
              </div>
            </div>
          </div>

          {/* Cuisine Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faUtensils} className="text-purple-500" />
              Cuisine Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {(restaurant.cuisineType || []).map((cuisine, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {cuisine}
                </span>
              ))}
              {(!restaurant.cuisineType || restaurant.cuisineType.length === 0) && (
                <span className="text-gray-500">No cuisine types specified</span>
              )}
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-blue-500" />
              Opening Hours
            </h3>
            <div className="space-y-2">
              {daysOfWeek.map(day => {
                const hours = restaurant.openingHours?.[day];
                return (
                  <div key={day} className="flex justify-between items-center">
                    <span className="capitalize font-medium">{day}</span>
                    <span className={hours?.isOpen ? 'text-green-600' : 'text-red-600'}>
                      {hours?.isOpen 
                        ? `${formatTime(hours.open)} - ${formatTime(hours.close)}`
                        : 'Closed'
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Rating & Reviews */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              Rating & Reviews
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {restaurant.rating ? restaurant.rating.toFixed(1) : 'No rating'}
              </div>
              <div className="text-gray-600">
                {restaurant.totalReviews || 0} reviews
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Status</h3>
            <div className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                restaurant.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                <FontAwesomeIcon 
                  icon={restaurant.isActive ? faToggleOn : faToggleOff} 
                  className="mr-2" 
                />
                {restaurant.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-500" />
              Timestamps
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-500">Created</label>
                <p>{restaurant.createdAt ? new Date(restaurant.createdAt.toDate()).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <label className="text-gray-500">Last Updated</label>
                <p>{restaurant.updatedAt ? new Date(restaurant.updatedAt.toDate()).toLocaleDateString() : 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">Delete Restaurant</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{restaurant.name}</strong>? 
              This action cannot be undone and will permanently remove all associated data.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors ${
                  actionLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {actionLoading ? 'Deleting...' : 'Delete Restaurant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Restaurant, restaurantService } from '@/lib/services/restaurant.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faArrowLeft, 
  faUpload, 
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faDollarSign,
  faUtensils
} from '@fortawesome/free-solid-svg-icons';

interface RestaurantFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisineType: string[];
  image: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
  openingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
}

const defaultFormData: RestaurantFormData = {
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  cuisineType: [],
  image: '',
  deliveryFee: 0,
  minimumOrder: 0,
  estimatedDeliveryTime: '30-45 mins',
  isActive: true,
  openingHours: {
    monday: { open: '09:00', close: '22:00', isOpen: true },
    tuesday: { open: '09:00', close: '22:00', isOpen: true },
    wednesday: { open: '09:00', close: '22:00', isOpen: true },
    thursday: { open: '09:00', close: '22:00', isOpen: true },
    friday: { open: '09:00', close: '22:00', isOpen: true },
    saturday: { open: '09:00', close: '22:00', isOpen: true },
    sunday: { open: '10:00', close: '21:00', isOpen: true }
  }
};

const cuisineOptions = [
  'Nigerian', 'Indian', 'Chinese', 'Italian', 'Mexican', 'American', 
  'Thai', 'Japanese', 'Mediterranean', 'French', 'BBQ', 'Seafood',
  'Vegetarian', 'Vegan', 'Fast Food', 'Continental', 'African'
];

const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function RestaurantFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = Boolean(params?.id);
  const restaurantId = params?.id as string;

  const [formData, setFormData] = useState<RestaurantFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Simplified auth check - skip complex admin auth for now
    const checkAuth = () => {
      // For development, allow access and load data immediately
      // TODO: Implement proper admin authentication later
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isEditing && restaurantId) {
      loadRestaurant();
    }
  }, [isEditing, restaurantId]);

  const loadRestaurant = async () => {
    try {
      setInitialLoading(true);
      const restaurant = await restaurantService.getRestaurantById(restaurantId);
      
      if (restaurant) {
        setFormData({
          name: restaurant.name,
          description: restaurant.description || '',
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          cuisineType: restaurant.cuisineType,
          image: restaurant.image || '',
          deliveryFee: restaurant.deliveryFee,
          minimumOrder: restaurant.minimumOrder,
          estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
          isActive: restaurant.isActive,
          openingHours: restaurant.openingHours || defaultFormData.openingHours
        });
        setImagePreview(restaurant.image || '');
      }
    } catch (err: any) {
      setError(`Failed to load restaurant: ${err.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCuisineToggle = useCallback((cuisine: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Save current scroll position
    const currentScrollY = window.scrollY;
    setScrollPosition(currentScrollY);
    
    setFormData(prev => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter(c => c !== cuisine)
        : [...prev.cuisineType, cuisine]
    }));
    
    // Restore scroll position after state update
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  }, []);

  const handleOpeningHoursChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image;

    setUploadingImage(true);
    try {
      const imageUrl = await restaurantService.uploadRestaurantImage(imageFile, restaurantId || 'new');
      return imageUrl;
    } catch (error) {
      console.warn('Image upload failed (Firebase Storage requires Blaze plan):', error);
      // For now, use a placeholder image or skip image upload
      // You can upgrade to Firebase Blaze plan to enable storage
      return 'https://via.placeholder.com/400x300/f97316/ffffff?text=Restaurant+Image';
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    if (formData.cuisineType.length === 0) {
      setError('Please select at least one cuisine type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload image if changed
      const imageUrl = await uploadImage();

      const restaurantData: Partial<Restaurant> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        cuisineType: formData.cuisineType,
        image: imageUrl,
        deliveryFee: formData.deliveryFee,
        minimumOrder: formData.minimumOrder,
        estimatedDeliveryTime: formData.estimatedDeliveryTime,
        isActive: formData.isActive,
        openingHours: formData.openingHours
      };

      if (isEditing) {
        await restaurantService.updateRestaurant(restaurantId, restaurantData);
      } else {
        await restaurantService.createRestaurant(restaurantData as Omit<Restaurant, 'id' | 'createdAt' | 'rating' | 'totalReviews'>);
      }

      router.push('/stores');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} restaurant`);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Update restaurant information' : 'Create a new restaurant profile'}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter restaurant name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+234 XXX XXX XXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="restaurant@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                Address *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={3}
                placeholder="Enter full restaurant address"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={4}
                placeholder="Describe your restaurant..."
              />
            </div>
          </div>
        </div>

        {/* Restaurant Image */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Restaurant Image</h2>
          
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Image Upload Options:</strong> Uses multiple fallback methods:
              <br />• Local server storage (preferred)
              <br />• Imgur API (free external hosting)
              <br />• Base64 encoding (for small images)
              <br />• Placeholder (if all fail)
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {imagePreview && (
              <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Restaurant preview"
                  className="w-full h-full object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cuisine Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <FontAwesomeIcon icon={faUtensils} className="mr-2" />
            Cuisine Types *
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cuisineOptions.map((cuisine) => (
              <label
                key={cuisine}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.cuisineType.includes(cuisine)
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleCuisineToggle(cuisine);
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.cuisineType.includes(cuisine)}
                  onChange={() => {}} // Controlled by onClick handler
                  className="sr-only"
                />
                <span className="text-sm font-medium">{cuisine}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
            Delivery Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (₦)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.deliveryFee}
                onChange={(e) => handleInputChange('deliveryFee', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Order (₦)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.minimumOrder}
                onChange={(e) => handleInputChange('minimumOrder', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                Delivery Time
              </label>
              <select
                value={formData.estimatedDeliveryTime}
                onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="15-30 mins">15-30 mins</option>
                <option value="30-45 mins">30-45 mins</option>
                <option value="45-60 mins">45-60 mins</option>
                <option value="60-90 mins">60-90 mins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            Opening Hours
          </h2>
          
          <div className="space-y-4">
            {dayNames.map((day) => (
              <div key={day} className="flex items-center gap-4">
                <div className="w-24">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {day}
                  </span>
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.openingHours[day].isOpen}
                    onChange={(e) => handleOpeningHoursChange(day, 'isOpen', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Open</span>
                </label>
                
                {formData.openingHours[day].isOpen && (
                  <>
                    <input
                      type="time"
                      value={formData.openingHours[day].open}
                      onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-sm text-gray-500">to</span>
                    <input
                      type="time"
                      value={formData.openingHours[day].close}
                      onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-8 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            {loading ? 'Saving...' : isEditing ? 'Update Restaurant' : 'Create Restaurant'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
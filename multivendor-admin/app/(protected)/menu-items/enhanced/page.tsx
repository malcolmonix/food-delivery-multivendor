"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MenuCategory, MenuItem, menuService, MenuStats } from '@/lib/services/menu.service';
import { Restaurant, restaurantService } from '@/lib/services/restaurant.service';
import { ensureAdminAuth } from '@/lib/firebase/menuverse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye,
  faUtensils,
  faList,
  faStar,
  faToggleOn,
  faToggleOff,
  faSearch,
  faCopy,
  faChartBar,
  faLeaf,
  faFire,
  faGluten
} from '@fortawesome/free-solid-svg-icons';

export default function EnhancedMenuPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuStats, setMenuStats] = useState<MenuStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // Simplified auth check - skip complex admin auth for now
    const checkAuth = () => {
      // For development, allow access and load data immediately
      setIsAuthenticating(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticating) return;
    loadRestaurants();
  }, [isAuthenticating]);

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenuData();
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    try {
      const data = await restaurantService.getAllRestaurants();
      setRestaurants(data);
      if (data.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(data[0].id);
      }
    } catch (err: any) {
      console.error('Restaurant loading error:', err);
      setError(err.message || 'Failed to load restaurants');
      // Show empty state instead of blocking
      setRestaurants([]);
    }
  };

  const loadMenuData = async () => {
    if (!selectedRestaurant) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [categoriesData, itemsData, statsData] = await Promise.all([
        menuService.getCategoriesByRestaurant(selectedRestaurant),
        menuService.getMenuItemsByRestaurant(selectedRestaurant),
        menuService.getMenuStats(selectedRestaurant)
      ]);
      
      setCategories(categoriesData);
      setMenuItems(itemsData);
      setMenuStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(query))) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Filter by type
    switch (filterType) {
      case 'available':
        filtered = filtered.filter(item => item.isAvailable);
        break;
      case 'unavailable':
        filtered = filtered.filter(item => !item.isAvailable);
        break;
      case 'popular':
        filtered = filtered.filter(item => item.isPopular);
        break;
      case 'featured':
        filtered = filtered.filter(item => item.isFeatured);
        break;
      case 'vegetarian':
        filtered = filtered.filter(item => item.isVegetarian);
        break;
      case 'vegan':
        filtered = filtered.filter(item => item.isVegan);
        break;
    }

    return filtered;
  }, [menuItems, searchQuery, selectedCategory, filterType]);

  const handleToggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      await menuService.updateItemAvailability(itemId, !currentStatus);
      await loadMenuData(); // Refresh data
    } catch (error) {
      console.error('Failed to update item availability:', error);
    }
  };

  const handleTogglePopular = async (itemId: string) => {
    try {
      await menuService.toggleItemPopularity(itemId);
      await loadMenuData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle popularity:', error);
    }
  };

  const handleToggleFeatured = async (itemId: string) => {
    try {
      await menuService.toggleItemFeatured(itemId);
      await loadMenuData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
    }
  };

  const handleDuplicateItem = async (itemId: string) => {
    try {
      await menuService.duplicateMenuItem(itemId);
      await loadMenuData(); // Refresh data
    } catch (error) {
      console.error('Failed to duplicate item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    try {
      await menuService.deleteMenuItem(itemId);
      await loadMenuData(); // Refresh data
    } catch (error) {
      console.error('Failed to delete item:', error);
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
            <FontAwesomeIcon icon={faUtensils} className="text-orange-500" />
            Menu Management
          </h1>
          <p className="text-gray-600 mt-2">Manage menu categories and items</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/menu-items/create?restaurant=${selectedRestaurant}`)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedRestaurant}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add Menu Item
          </button>
          
          <button
            onClick={() => router.push(`/categories/create?restaurant=${selectedRestaurant}`)}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            disabled={!selectedRestaurant}
          >
            <FontAwesomeIcon icon={faList} />
            Add Category
          </button>
        </div>
      </div>

      {/* Restaurant Selection and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Restaurant
          </label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select a restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        {menuStats && (
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{menuStats.totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{menuStats.activeItems}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{menuStats.categoriesCount}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">₦{menuStats.averagePrice.toFixed(0)}</div>
              <div className="text-sm text-gray-600">Avg Price</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {selectedRestaurant && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Search Items
              </label>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="popular">Popular</option>
                <option value="featured">Featured</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setFilterType('all');
                }}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
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
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700 text-sm">{error}</div>
        </div>
      )}

      {/* Menu Items Grid */}
      {!loading && !error && selectedRestaurant && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const category = categories.find(cat => cat.id === item.categoryId);
            
            return (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Item Image */}
                <div className="relative h-48 bg-gray-200">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {!item.isAvailable && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Unavailable
                      </span>
                    )}
                    {item.isPopular && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Popular
                      </span>
                    )}
                    {item.isFeatured && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Dietary Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    {item.isVegetarian && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center" title="Vegetarian">
                        <FontAwesomeIcon icon={faLeaf} className="text-white text-xs" />
                      </div>
                    )}
                    {item.isVegan && (
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center" title="Vegan">
                        <FontAwesomeIcon icon={faLeaf} className="text-white text-xs" />
                      </div>
                    )}
                    {item.isSpicy && (
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center" title="Spicy">
                        <FontAwesomeIcon icon={faFire} className="text-white text-xs" />
                      </div>
                    )}
                    {item.isGlutenFree && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" title="Gluten Free">
                        <FontAwesomeIcon icon={faGluten} className="text-white text-xs" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.name}</h3>
                    <div className="text-lg font-bold text-orange-600 ml-2">
                      ₦{item.price.toLocaleString()}
                      {item.discountPrice && (
                        <span className="text-sm text-gray-500 line-through ml-1">
                          ₦{item.discountPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  {category && (
                    <div className="text-xs text-gray-500 mb-3">
                      Category: {category.name}
                    </div>
                  )}

                  {/* Preparation Time and Variations Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {item.preparationTime && (
                      <span>{item.preparationTime} mins prep</span>
                    )}
                    {item.variations && item.variations.length > 0 && (
                      <span>{item.variations.length} variation(s)</span>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <span>{item.addons.length} addon(s)</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => router.push(`/menu-items/${item.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      
                      <button
                        onClick={() => router.push(`/menu-items/${item.id}/edit`)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit Item"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      
                      <button
                        onClick={() => handleDuplicateItem(item.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Duplicate Item"
                      >
                        <FontAwesomeIcon icon={faCopy} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTogglePopular(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isPopular 
                            ? 'text-yellow-600 hover:bg-yellow-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title="Toggle Popular"
                      >
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                      
                      <button
                        onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isAvailable 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        title={item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                      >
                        <FontAwesomeIcon icon={item.isAvailable ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && selectedRestaurant && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedCategory !== 'all' || filterType !== 'all' 
              ? 'No menu items found' 
              : 'No menu items yet'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search terms or filters' 
              : 'Get started by adding your first menu item'
            }
          </p>
          {(!searchQuery && selectedCategory === 'all' && filterType === 'all') && (
            <button
              onClick={() => router.push(`/menu-items/create?restaurant=${selectedRestaurant}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} />
              Add Menu Item
            </button>
          )}
        </div>
      )}

      {/* No Restaurant Selected */}
      {!selectedRestaurant && !loading && (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faUtensils} className="text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Restaurant</h3>
          <p className="text-gray-600 mb-6">Choose a restaurant to manage its menu</p>
        </div>
      )}
    </main>
  );
}
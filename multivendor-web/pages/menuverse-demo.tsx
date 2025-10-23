import React from 'react';
import { useEateries, useEaterySearch } from '../lib/hooks/use-menuverse';
import { Eatery } from '../lib/services/menuverse';
import HeroBanner from '../components/HeroBanner';
import styles from '../styles/Home.module.css';
import gridStyles from '../styles/HomeGrid.module.css';

// MenuVerse Restaurant Card Component
interface MenuverseRestaurantCardProps {
  eatery: Eatery;
  onClick?: () => void;
}

const MenuverseRestaurantCard: React.FC<MenuverseRestaurantCardProps> = ({ eatery, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="relative h-48">
        <img
          src={eatery.bannerUrl || eatery.logoUrl || '/placeholder-restaurant.jpg'}
          alt={eatery.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-restaurant.jpg';
          }}
        />
        {eatery.logoUrl && (
          <div className="absolute bottom-2 left-2 w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
            <img
              src={eatery.logoUrl}
              alt={`${eatery.name} logo`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{eatery.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{eatery.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Available Now</span>
          <span className="text-sm font-medium text-primary-600">View Menu</span>
        </div>
      </div>
    </div>
  );
};

// Search Component
interface SearchBarProps {
  onSearch: (term: string) => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search restaurants..."
          className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={loading}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </form>
  );
};

export default function MenuverseHome() {
  const { eateries, loading: eateriesLoading, error: eateriesError } = useEateries(24);
  const { results: searchResults, loading: searchLoading, error: searchError, search } = useEaterySearch();
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    await search(searchTerm);
  };

  const handleClearSearch = () => {
    setIsSearching(false);
  };

  const handleRestaurantClick = (eatery: Eatery) => {
    // TODO: Navigate to restaurant detail page
    console.log('Navigate to restaurant:', eatery.id, eatery.name);
    // Router.push(`/restaurant/${eatery.id}`);
  };

  const displayedEateries = isSearching ? searchResults : eateries;
  const loading = isSearching ? searchLoading : eateriesLoading;
  const error = isSearching ? searchError : eateriesError;

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <HeroBanner />

      {/* Main Content */}
      <main className={styles.main}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Search Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Discover Amazing Restaurants
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Fresh food from MenuVerse partner restaurants
            </p>
            
            <SearchBar onSearch={handleSearch} loading={loading} />
            
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ← Back to all restaurants
              </button>
            )}
          </div>

          {/* Results Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {isSearching 
                  ? `Search Results (${searchResults.length})` 
                  : `Available Restaurants (${eateries.length})`
                }
              </h2>
              
              {loading && (
                <div className="flex items-center text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Loading...
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading restaurants</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                    <p className="text-xs text-red-600 mt-2">
                      Make sure MenuVerse Firebase credentials are configured in .env.local
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Restaurant Grid */}
            <div className={gridStyles.grid}>
              {displayedEateries.map((eatery) => (
                <MenuverseRestaurantCard
                  key={eatery.id}
                  eatery={eatery}
                  onClick={() => handleRestaurantClick(eatery)}
                />
              ))}
            </div>

            {!loading && displayedEateries.length === 0 && !error && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {isSearching ? 'No restaurants found' : 'No restaurants available'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isSearching 
                    ? 'Try a different search term' 
                    : 'Check back later for new restaurants'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Development Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">MenuVerse Integration</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This page demonstrates integration with MenuVerse API. Configure your MenuVerse Firebase credentials 
                  in .env.local to see real restaurant data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
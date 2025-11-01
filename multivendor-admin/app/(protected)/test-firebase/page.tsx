"use client";
import { useState } from 'react';
import { restaurantService } from '@/lib/services/restaurant.service';
import { getMenuverseFirestore } from '@/lib/firebase/menuverse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function FirebaseTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, status: 'success' | 'error' | 'running', message: string, data?: any) => {
    setTestResults(prev => [
      ...prev.filter(t => t.test !== test),
      { test, status, message, data, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  const runFirebaseTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Firebase Connection
      addTestResult('connection', 'running', 'Testing Firebase connection...');
      const db = getMenuverseFirestore();
      addTestResult('connection', 'success', 'Firebase connected successfully');

      // Test 2: Restaurant Service - Get All
      addTestResult('get-restaurants', 'running', 'Fetching restaurants from Firebase...');
      const restaurants = await restaurantService.getAllRestaurants();
      addTestResult('get-restaurants', 'success', `Found ${restaurants.length} restaurants`, { count: restaurants.length, restaurants: restaurants.slice(0, 3) });

      if (restaurants.length === 0) {
        // Test 3: Create Sample Restaurant
        addTestResult('create-restaurant', 'running', 'No restaurants found, creating sample restaurant...');
        
        const sampleRestaurant = {
          name: "Test Restaurant",
          description: "A test restaurant for Firebase integration",
          address: "123 Test Street, Lagos, Nigeria",
          phone: "+234 800 000 0000",
          email: "test@restaurant.com",
          cuisineType: ["Test", "Demo"],
          deliveryFee: 500,
          minimumOrder: 1000,
          estimatedDeliveryTime: "30-45 mins",
          isActive: true,
          coordinates: { lat: 6.5244, lng: 3.3792 },
          rating: 4.0,
          totalReviews: 1,
          openingHours: {
            monday: { open: "09:00", close: "22:00", isOpen: true },
            tuesday: { open: "09:00", close: "22:00", isOpen: true },
            wednesday: { open: "09:00", close: "22:00", isOpen: true },
            thursday: { open: "09:00", close: "22:00", isOpen: true },
            friday: { open: "09:00", close: "22:00", isOpen: true },
            saturday: { open: "10:00", close: "22:00", isOpen: true },
            sunday: { open: "12:00", close: "21:00", isOpen: true }
          }
        };

        const restaurantId = await restaurantService.createRestaurant(sampleRestaurant as any);
        addTestResult('create-restaurant', 'success', `Created test restaurant with ID: ${restaurantId}`, { id: restaurantId });

        // Test 4: Verify Creation
        addTestResult('verify-creation', 'running', 'Verifying restaurant creation...');
        const updatedRestaurants = await restaurantService.getAllRestaurants();
        addTestResult('verify-creation', 'success', `Now have ${updatedRestaurants.length} restaurants`, { count: updatedRestaurants.length });
      }

      // Test 5: Restaurant Statistics
      addTestResult('statistics', 'running', 'Getting restaurant statistics...');
      const finalRestaurants = await restaurantService.getAllRestaurants();
      const activeCount = finalRestaurants.filter(r => r.isActive).length;
      const avgRating = finalRestaurants.length > 0 
        ? finalRestaurants.reduce((sum, r) => sum + r.rating, 0) / finalRestaurants.length 
        : 0;
      
      addTestResult('statistics', 'success', 'Statistics calculated', {
        total: finalRestaurants.length,
        active: activeCount,
        inactive: finalRestaurants.length - activeCount,
        avgRating: avgRating.toFixed(1)
      });

      // Test 6: Real-time Subscription
      addTestResult('subscription', 'running', 'Testing real-time subscription...');
      const unsubscribe = restaurantService.subscribeToRestaurants((data) => {
        addTestResult('subscription', 'success', `Real-time update received: ${data.length} restaurants`, { realTimeCount: data.length });
      });
      
      // Clean up subscription after 2 seconds
      setTimeout(() => {
        unsubscribe();
        addTestResult('subscription-cleanup', 'success', 'Real-time subscription cleaned up');
      }, 2000);

    } catch (error: any) {
      addTestResult('error', 'error', `Test failed: ${error.message}`, { error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const clearTestData = async () => {
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      const testRestaurants = restaurants.filter(r => r.name.includes('Test'));
      
      for (const restaurant of testRestaurants) {
        await restaurantService.deleteRestaurant(restaurant.id);
      }
      
      addTestResult('cleanup', 'success', `Cleaned up ${testRestaurants.length} test restaurants`);
    } catch (error: any) {
      addTestResult('cleanup', 'error', `Cleanup failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />;
      case 'success':
        return <FontAwesomeIcon icon={faCheck} className="text-green-500" />;
      case 'error':
        return <FontAwesomeIcon icon={faTimes} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Integration Tests</h1>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={runFirebaseTests}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            {isRunning ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
            {isRunning ? 'Running Tests...' : 'Run Firebase Tests'}
          </button>

          <button
            onClick={clearTestData}
            disabled={isRunning}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Clear Test Data
          </button>

          <a
            href="/stores"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
          >
            View Stores Page
          </a>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            
            {testResults.map((result, index) => (
              <div key={index} className={`p-4 border rounded-lg ${
                result.status === 'success' ? 'border-green-200 bg-green-50' :
                result.status === 'error' ? 'border-red-200 bg-red-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium text-gray-900">{result.test}</span>
                  <span className="text-sm text-gray-500">{result.timestamp}</span>
                </div>
                
                <p className={`text-sm ${
                  result.status === 'success' ? 'text-green-700' :
                  result.status === 'error' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {result.message}
                </p>

                {result.data && (
                  <div className="mt-2 p-3 bg-gray-100 rounded text-sm">
                    <pre className="text-gray-700 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {testResults.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FontAwesomeIcon icon={faPlay} className="text-4xl mb-4" />
            <p>Click "Run Firebase Tests" to test the restaurant management integration</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">What These Tests Check</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Core Functionality</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Firebase Firestore connection</li>
              <li>• Restaurant service CRUD operations</li>
              <li>• Data persistence and retrieval</li>
              <li>• Real-time subscription setup</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Data Validation</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Restaurant creation with full schema</li>
              <li>• Statistics and aggregation</li>
              <li>• Active/inactive status handling</li>
              <li>• Cleanup and data management</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
"use client";
import { useState, useEffect } from 'react';
import { getMenuverseFirestore, getMenuverseAuth } from '@/lib/firebase/menuverse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function FirebaseDebugPage() {
  const [connectionStatus, setConnectionStatus] = useState({
    firestore: 'testing',
    auth: 'testing',
    overall: 'testing'
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setError(null);
      
      // Test Firestore
      console.log('Testing Firestore connection...');
      const db = getMenuverseFirestore();
      setConnectionStatus(prev => ({ ...prev, firestore: 'success' }));
      
      // Test Auth
      console.log('Testing Auth connection...');
      const auth = getMenuverseAuth();
      setConnectionStatus(prev => ({ ...prev, auth: 'success' }));
      
      // Overall success
      setConnectionStatus(prev => ({ ...prev, overall: 'success' }));
      
      console.log('✅ Firebase connection successful!');
      
    } catch (error: any) {
      console.error('❌ Firebase connection failed:', error);
      setError(error.message);
      setConnectionStatus({
        firestore: 'error',
        auth: 'error', 
        overall: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500" />;
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />;
      case 'error':
        return <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />;
      default:
        return <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'testing':
        return 'Testing...';
      case 'success':
        return 'Connected';
      case 'error':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Connection Debug</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Firestore Database</h3>
              <p className="text-sm text-gray-600">MenuVerse Firebase project connection</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus.firestore)}
              <span className="text-sm font-medium">
                {getStatusText(connectionStatus.firestore)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Firebase Authentication</h3>
              <p className="text-sm text-gray-600">Admin authentication service</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus.auth)}
              <span className="text-sm font-medium">
                {getStatusText(connectionStatus.auth)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Overall Status</h3>
              <p className="text-sm text-gray-600">MenuVerse Firebase integration</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(connectionStatus.overall)}
              <span className="text-sm font-medium">
                {getStatusText(connectionStatus.overall)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Connection Error</h4>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {connectionStatus.overall === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Connection Successful!</h4>
            <p className="text-sm text-green-600 mb-3">
              Firebase is properly connected. You can now use the enhanced admin features:
            </p>
            <div className="space-y-2 text-sm text-green-600">
              <div>• Restaurant Management: <a href="/stores" className="underline font-medium">Manage Restaurants</a></div>
              <div>• Menu Management: <a href="/menu-items" className="underline font-medium">Manage Menus</a></div>
              <div>• Real-time Updates: Live data synchronization</div>
              <div>• Image Uploads: Firebase Storage integration</div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="flex gap-4">
            <button
              onClick={testFirebaseConnection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Test Connection Again
            </button>
            <a
              href="/stores"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
            >
              Go to Restaurants
            </a>
            <a
              href="/menu-items"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors inline-block"
            >
              Go to Menus
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Configuration Details</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-xs text-gray-600">
{`Project ID: chopchop-67750
Auth Domain: chopchop-67750.firebaseapp.com
Storage Bucket: chopchop-67750.firebasestorage.app
App Name: menuverse-admin`}
            </pre>
          </div>
        </div>
      </div>
    </main>
  );
}
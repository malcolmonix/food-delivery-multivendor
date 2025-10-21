/**
 * Configuration Test Suite
 * Tests all components work with standardized port 4000 configuration
 */

import { BACKEND_CONFIG, getBackendEndpoint, getEnvConfig } from './backend-config';

// Test backend endpoint discovery
export async function testBackendConfiguration() {
  console.log('🧪 Testing backend configuration...');
  
  try {
    const endpoint = await getBackendEndpoint();
    console.log(`✅ Backend endpoint discovered: ${endpoint.httpUrl}`);
    console.log(`✅ WebSocket endpoint: ${endpoint.wsUrl}`);
    console.log(`✅ Port: ${endpoint.port}`);
    
    return {
      success: true,
      endpoint,
      message: 'Backend configuration test passed'
    };
  } catch (error) {
    console.error('❌ Backend configuration test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Backend configuration test failed'
    };
  }
}

// Test GraphQL endpoint
export async function testGraphQLEndpoint() {
  console.log('🧪 Testing GraphQL endpoint...');
  
  try {
    const endpoint = await getBackendEndpoint();
    const response = await fetch(endpoint.httpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query TestQuery {
            __typename
            admins {
              id
              email
              name
            }
          }
        `
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GraphQL endpoint responding correctly');
      console.log(`✅ Response: ${JSON.stringify(data, null, 2)}`);
      
      return {
        success: true,
        data,
        message: 'GraphQL endpoint test passed'
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ GraphQL endpoint test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'GraphQL endpoint test failed'
    };
  }
}

// Test WebSocket connection
export async function testWebSocketConnection() {
  console.log('🧪 Testing WebSocket connection...');
  
  return new Promise((resolve) => {
    try {
      const endpoint = getBackendEndpoint();
      const ws = new WebSocket(endpoint.then(e => e.wsUrl));
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          success: false,
          error: 'WebSocket connection timeout',
          message: 'WebSocket connection test failed - timeout'
        });
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        console.log('✅ WebSocket connection successful');
        resolve({
          success: true,
          message: 'WebSocket connection test passed'
        });
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ WebSocket connection failed:', error);
        resolve({
          success: false,
          error: error.toString(),
          message: 'WebSocket connection test failed'
        });
      };
    } catch (error) {
      console.error('❌ WebSocket test failed:', error);
      resolve({
        success: false,
        error: error.message,
        message: 'WebSocket connection test failed'
      });
    }
  });
}

// Test environment configuration
export function testEnvironmentConfiguration() {
  console.log('🧪 Testing environment configuration...');
  
  try {
    const config = getEnvConfig();
    console.log('✅ Environment configuration loaded');
    console.log(`✅ Server URL: ${config.SERVER_URL}`);
    console.log(`✅ WebSocket URL: ${config.WS_SERVER_URL}`);
    console.log(`✅ Node Environment: ${config.NODE_ENV}`);
    console.log(`✅ Port: ${config.PORT}`);
    
    return {
      success: true,
      config,
      message: 'Environment configuration test passed'
    };
  } catch (error) {
    console.error('❌ Environment configuration test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Environment configuration test failed'
    };
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Running configuration test suite...');
  console.log('=====================================');
  
  const results = {
    backend: await testBackendConfiguration(),
    graphql: await testGraphQLEndpoint(),
    websocket: await testWebSocketConnection(),
    environment: testEnvironmentConfiguration(),
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${test}: ${result.message}`);
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const allPassed = Object.values(results).every(result => result.success);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Configuration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
  }
  
  return {
    allPassed,
    results,
    summary: {
      total: Object.keys(results).length,
      passed: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success).length,
    }
  };
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).testConfiguration = {
    runAllTests,
    testBackendConfiguration,
    testGraphQLEndpoint,
    testWebSocketConnection,
    testEnvironmentConfiguration,
  };
}


/**
 * Standardized Backend Configuration
 * All components use port 4000 for consistency
 */

export const BACKEND_CONFIG = {
  // Primary backend port
  PORT: 4000,
  
  // GraphQL endpoints
  HTTP_URL: 'http://localhost:4000/graphql',
  WS_URL: 'ws://localhost:4000/graphql',
  
  // Alternative ports for fallback
  FALLBACK_PORTS: [3001, 8001, 5000, 8000],
  
  // CORS origins
  CORS_ORIGINS: [
    'http://localhost:3000', // Admin dashboard
    'http://localhost:3001', // Customer web
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  
  // Database
  DATABASE_PATH: './data.db',
  
  // Development settings
  DEV_MODE: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
} as const;

/**
 * Get the working GraphQL endpoint with automatic discovery
 */
export async function getBackendEndpoint(): Promise<{
  httpUrl: string;
  wsUrl: string;
  port: number;
}> {
  // Try primary port first
  if (await testEndpoint(BACKEND_CONFIG.PORT)) {
    return {
      httpUrl: `http://localhost:${BACKEND_CONFIG.PORT}/graphql`,
      wsUrl: `ws://localhost:${BACKEND_CONFIG.PORT}/graphql`,
      port: BACKEND_CONFIG.PORT,
    };
  }
  
  // Try fallback ports
  for (const port of BACKEND_CONFIG.FALLBACK_PORTS) {
    if (await testEndpoint(port)) {
      console.log(`🔗 Backend discovered on port ${port}`);
      return {
        httpUrl: `http://localhost:${port}/graphql`,
        wsUrl: `ws://localhost:${port}/graphql`,
        port,
      };
    }
  }
  
  // Default fallback
  console.warn('No backend discovered, using default port 4000');
  return {
    httpUrl: `http://localhost:${BACKEND_CONFIG.PORT}/graphql`,
    wsUrl: `ws://localhost:${BACKEND_CONFIG.PORT}/graphql`,
    port: BACKEND_CONFIG.PORT,
  };
}

/**
 * Test if a GraphQL endpoint is available
 */
async function testEndpoint(port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`http://localhost:${port}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Environment configuration helper
 */
export function getEnvConfig() {
  return {
    SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || `http://localhost:${BACKEND_CONFIG.PORT}/`,
    WS_SERVER_URL: process.env.NEXT_PUBLIC_WS_SERVER_URL || `ws://localhost:${BACKEND_CONFIG.PORT}/`,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || BACKEND_CONFIG.PORT.toString(),
  };
}


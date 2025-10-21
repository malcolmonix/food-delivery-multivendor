/**
 * Dynamic GraphQL endpoint discovery
 * Automatically detects running backend on common ports
 */

const COMMON_PORTS = [4000, 8000, 8001, 3001, 5000];
const GRAPHQL_PATH = '/graphql';

interface EndpointConfig {
  httpUrl: string;
  wsUrl: string;
  port: number;
}

/**
 * Test if a GraphQL endpoint is accessible
 */
async function testEndpoint(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}${GRAPHQL_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __schema { queryType { name } } }'
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Discover active GraphQL endpoint
 */
export async function discoverGraphQLEndpoint(): Promise<EndpointConfig> {
  // First try environment variable if set
  const envPort = process.env.NEXT_PUBLIC_SERVER_URL?.match(/:(\d+)/)?.[1];
  if (envPort) {
    const port = parseInt(envPort);
    if (await testEndpoint(port)) {
      return {
        httpUrl: `http://localhost:${port}${GRAPHQL_PATH}`,
        wsUrl: `ws://localhost:${port}${GRAPHQL_PATH}`,
        port
      };
    }
  }

  // Try common ports
  for (const port of COMMON_PORTS) {
    if (await testEndpoint(port)) {
      console.log(`✅ GraphQL backend discovered on port ${port}`);
      return {
        httpUrl: `http://localhost:${port}${GRAPHQL_PATH}`,
        wsUrl: `ws://localhost:${port}${GRAPHQL_PATH}`,
        port
      };
    }
  }

  // Fallback to default
  console.warn('⚠️ No GraphQL backend found, using default port 4000');
  return {
    httpUrl: `http://localhost:4000${GRAPHQL_PATH}`,
    wsUrl: `ws://localhost:4000${GRAPHQL_PATH}`,
    port: 4000
  };
}

/**
 * Get cached endpoint or discover new one
 */
let cachedEndpoint: EndpointConfig | null = null;

export async function getGraphQLEndpoint(): Promise<EndpointConfig> {
  if (cachedEndpoint) {
    return cachedEndpoint;
  }

  cachedEndpoint = await discoverGraphQLEndpoint();
  return cachedEndpoint;
}

/**
 * Force re-discovery (useful for reconnection scenarios)
 */
export function resetEndpointCache(): void {
  cachedEndpoint = null;
}
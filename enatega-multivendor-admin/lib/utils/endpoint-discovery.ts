/**
 * Simple GraphQL endpoint discovery for Apollo client
 * Tests common ports and returns the working one
 */

const COMMON_PORTS = [4000, 3001, 8001, 5000, 8000]; // Prioritize port 4000

/**
 * Test if a GraphQL endpoint is available
 */
async function testGraphQLEndpoint(port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    const response = await fetch(`http://localhost:${port}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ __typename }',
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the working GraphQL endpoint URL
 */
export async function getWorkingGraphQLUrl(): Promise<string> {
  // Check cached port first
  const cachedPort = localStorage.getItem('graphql-port');
  if (cachedPort) {
    const port = parseInt(cachedPort, 10);
    if (await testGraphQLEndpoint(port)) {
      return `http://localhost:${port}/`;
    } else {
      localStorage.removeItem('graphql-port');
    }
  }

  // Test common ports
  for (const port of COMMON_PORTS) {
    if (await testGraphQLEndpoint(port)) {
      localStorage.setItem('graphql-port', port.toString());
      console.log(`🔗 GraphQL endpoint discovered on port ${port}`);
      return `http://localhost:${port}/`;
    }
  }

  // Fallback to port 4000
  console.warn('No GraphQL endpoint discovered, falling back to port 4000');
  return 'http://localhost:4000/';
}

/**
 * Get WebSocket URL from HTTP URL
 */
export function getWebSocketUrl(httpUrl: string): string {
  return httpUrl.replace('http://', 'ws://');
}
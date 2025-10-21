/**
 * Dynamic GraphQL endpoint discovery for old admin
 * Replaces hardcoded port configuration with automatic detection
 */

import React from 'react';

export interface GraphQLEndpoint {
  url: string;
  wsUrl: string;
  port: number;
}

const COMMON_PORTS = [4000, 3001, 8001, 5000, 8000]; // Prioritize port 4000

/**
 * Test if a GraphQL endpoint is available
 */
async function testGraphQLEndpoint(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{ __typename }',
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Discover the active GraphQL endpoint
 */
export async function discoverGraphQLEndpoint(): Promise<GraphQLEndpoint | null> {
  // Check if we have a cached endpoint that's still working
  const cachedPort = localStorage.getItem('graphql-port');
  if (cachedPort) {
    const port = parseInt(cachedPort, 10);
    if (await testGraphQLEndpoint(port)) {
      return {
        url: `http://localhost:${port}/graphql`,
        wsUrl: `ws://localhost:${port}/graphql`,
        port,
      };
    } else {
      // Clear invalid cache
      localStorage.removeItem('graphql-port');
    }
  }

  // Test common ports
  for (const port of COMMON_PORTS) {
    if (await testGraphQLEndpoint(port)) {
      // Cache the working port
      localStorage.setItem('graphql-port', port.toString());
      return {
        url: `http://localhost:${port}/graphql`,
        wsUrl: `ws://localhost:${port}/graphql`,
        port,
      };
    }
  }

  return null;
}

/**
 * Get GraphQL endpoint with fallback
 */
export async function getGraphQLEndpoint(): Promise<GraphQLEndpoint> {
  const discovered = await discoverGraphQLEndpoint();
  
  if (discovered) {
    console.log(`🔗 GraphQL endpoint discovered on port ${discovered.port}`);
    return discovered;
  }

  // Fallback to default port 4000
  console.warn('No GraphQL endpoint discovered, falling back to port 4000');
  return {
    url: 'http://localhost:4000/graphql',
    wsUrl: 'ws://localhost:4000/graphql',
    port: 4000,
  };
}

/**
 * Hook for React components to get GraphQL endpoint
 */
export function useGraphQLEndpoint() {
  const [endpoint, setEndpoint] = React.useState<GraphQLEndpoint | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function discover() {
      try {
        const result = await getGraphQLEndpoint();
        if (mounted) {
          setEndpoint(result);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to discover GraphQL endpoint');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    discover();

    return () => {
      mounted = false;
    };
  }, []);

  return { endpoint, loading, error };
}
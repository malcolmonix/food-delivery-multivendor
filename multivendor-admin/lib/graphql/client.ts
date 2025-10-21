"use client";
import { GraphQLClient } from 'graphql-request';
import { getGraphQLEndpoint } from '../utils/endpoint-discovery';

let cachedClient: GraphQLClient | null = null;

export async function getClient(): Promise<GraphQLClient> {
  // Return cached client if available
  if (cachedClient) {
    return cachedClient;
  }

  // Discover active GraphQL endpoint
  const endpoint = await getGraphQLEndpoint();

  const headers: Record<string, string> = {};
  try {
    const raw = localStorage.getItem('user-Multivendor-Admin');
    if (raw) {
      const { token } = JSON.parse(raw);
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}

  cachedClient = new GraphQLClient(endpoint.httpUrl, { headers });
  console.log(`🔗 GraphQL client connected to ${endpoint.httpUrl}`);
  
  return cachedClient;
}

/**
 * Force client recreation (useful for reconnection)
 */
export function resetClient(): void {
  cachedClient = null;
}

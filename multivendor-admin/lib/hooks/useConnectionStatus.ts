/**
 * Connection Status Hook
 * Monitor GraphQL backend connectivity and provide reconnection
 * Optimized to prevent race conditions and IndexedDB issues
 */
"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { getGraphQLEndpoint, resetEndpointCache } from '../utils/endpoint-discovery';
import { resetClient } from '../graphql/client';

interface ConnectionStatus {
  isConnected: boolean;
  endpoint: string | null;
  port: number | null;
  isReconnecting: boolean;
  error: string | null;
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    endpoint: null,
    port: null,
    isReconnecting: false,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  const checkConnection = useCallback(async () => {
    // Prevent overlapping checks
    if (isCheckingRef.current) {
      return;
    }

    try {
      isCheckingRef.current = true;
      setStatus(prev => ({ ...prev, isReconnecting: true, error: null }));
      
      const endpoint = await getGraphQLEndpoint();
      
      setStatus({
        isConnected: true,
        endpoint: endpoint.httpUrl,
        port: endpoint.port,
        isReconnecting: false,
        error: null,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isReconnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }));
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  const reconnect = useCallback(async () => {
    // Clear any existing timeouts/intervals
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    resetEndpointCache();
    resetClient();
    
    // Debounce reconnection attempts
    timeoutRef.current = setTimeout(async () => {
      await checkConnection();
    }, 1000);
  }, [checkConnection]);

  useEffect(() => {
    // Initial check with delay to prevent race conditions during page load
    timeoutRef.current = setTimeout(checkConnection, 500);
    
    // Check connection every 60 seconds (reduced frequency)
    intervalRef.current = setInterval(checkConnection, 60000);
    
    return () => {
      // Cleanup all timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      isCheckingRef.current = false;
    };
  }, [checkConnection]);

  return {
    ...status,
    reconnect,
    checkConnection,
  };
}
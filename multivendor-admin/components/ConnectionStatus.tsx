/**
 * Connection Status Component
 * Shows current GraphQL backend connection status
 */
"use client";
import { useConnectionStatus } from '../lib/hooks/useConnectionStatus';

export function ConnectionStatus() {
  const { isConnected, endpoint, port, isReconnecting, error, reconnect } = useConnectionStatus();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Connected to port {port}</span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span>Disconnected</span>
      <button 
        onClick={reconnect}
        className="ml-1 px-2 py-0.5 bg-red-100 hover:bg-red-200 rounded text-xs"
      >
        Retry
      </button>
    </div>
  );
}
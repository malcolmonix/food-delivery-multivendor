/**
 * Real-time Order Notifications Hook
 * Provides sound alerts and notifications for new orders
 */
"use client";
import { useEffect, useState, useRef } from 'react';
import { getClient } from '@/lib/graphql/client';

interface OrderNotification {
  id: string;
  orderId: string;
  restaurant: string;
  customer: string;
  amount: number;
  timestamp: string;
}

export function useOrderNotifications() {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrderCountRef = useRef(0);

  // Initialize audio for notifications
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNotificationSound = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };

    audioRef.current = { play: playNotificationSound } as any;
  }, []);

  // Check for new orders periodically
  useEffect(() => {
    if (!isEnabled) return;

    const checkNewOrders = async () => {
      try {
        const client = await getClient();
        const data = await client.request(/* GraphQL */ `
          query ordersCount($status: String) {
            ordersCount(status: $status)
          }
        `, { status: 'PENDING' });

        const currentCount = data.ordersCount;
        
        // If we have more pending orders than before, play notification
        if (currentCount > lastOrderCountRef.current && lastOrderCountRef.current > 0) {
          const newOrdersCount = currentCount - lastOrderCountRef.current;
          
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play();
          }

          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('New Order Received!', {
              body: `${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received`,
              icon: '/favicon.ico',
              tag: 'new-order'
            });
          }
        }

        lastOrderCountRef.current = currentCount;
      } catch (error) {
        console.error('Failed to check for new orders:', error);
      }
    };

    // Check immediately
    checkNewOrders();

    // Set up interval to check every 10 seconds
    const interval = setInterval(checkNewOrders, 10000);

    return () => clearInterval(interval);
  }, [isEnabled]);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  // Enable/disable notifications
  const toggleNotifications = () => {
    setIsEnabled(!isEnabled);
  };

  return {
    notifications,
    isEnabled,
    toggleNotifications,
    requestNotificationPermission,
  };
}

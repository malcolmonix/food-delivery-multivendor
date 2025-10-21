/**
 * Order Timeline Component
 * Shows visual timeline of order status changes
 */
"use client";
import { useState, useEffect } from 'react';

interface TimelineEvent {
  status: string;
  timestamp: string;
  description?: string;
}

interface OrderTimelineProps {
  orderId: string;
  currentStatus: string;
  createdAt: string;
  completedAt?: string | null;
}

const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'];
const STATUS_LABELS = {
  PENDING: 'Order Placed',
  ACCEPTED: 'Order Accepted',
  PREPARING: 'Preparing Food',
  ON_THE_WAY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500',
  ACCEPTED: 'bg-blue-500',
  PREPARING: 'bg-purple-500',
  ON_THE_WAY: 'bg-indigo-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
};

export default function OrderTimeline({ orderId, currentStatus, createdAt, completedAt }: OrderTimelineProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Generate timeline based on current status
    const events: TimelineEvent[] = [];
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    
    // Add all events up to current status
    for (let i = 0; i <= currentIndex; i++) {
      const status = STATUS_ORDER[i];
      let timestamp = '';
      
      if (status === 'PENDING') {
        timestamp = createdAt;
      } else if (status === currentStatus && completedAt) {
        timestamp = completedAt;
      } else {
        // Estimate timestamp for intermediate statuses
        const createdAtDate = new Date(createdAt);
        const completedAtDate = completedAt ? new Date(completedAt) : new Date();
        const timeDiff = completedAtDate.getTime() - createdAtDate.getTime();
        const estimatedTime = createdAtDate.getTime() + (timeDiff * (i / currentIndex));
        timestamp = new Date(estimatedTime).toISOString();
      }
      
      events.push({
        status,
        timestamp,
        description: getStatusDescription(status),
      });
    }

    // Add cancelled status if applicable
    if (currentStatus === 'CANCELLED') {
      events.push({
        status: 'CANCELLED',
        timestamp: completedAt || createdAt,
        description: 'Order was cancelled',
      });
    }

    setTimeline(events);
  }, [orderId, currentStatus, createdAt, completedAt]);

  const getStatusDescription = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'Customer placed the order and is waiting for restaurant confirmation';
      case 'ACCEPTED':
        return 'Restaurant has accepted the order and will start preparing';
      case 'PREPARING':
        return 'Restaurant is preparing the food items';
      case 'ON_THE_WAY':
        return 'Food is ready and rider is on the way for delivery';
      case 'DELIVERED':
        return 'Order has been successfully delivered to customer';
      case 'CANCELLED':
        return 'Order was cancelled';
      default:
        return '';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const isCompleted = (status: string) => {
    return STATUS_ORDER.indexOf(status) <= STATUS_ORDER.indexOf(currentStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
      <div className="space-y-4">
        {timeline.map((event, index) => (
          <div key={event.status} className="flex items-start space-x-3">
            {/* Timeline dot */}
            <div className={`w-3 h-3 rounded-full mt-1.5 ${
              isCompleted(event.status) 
                ? STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || 'bg-gray-500'
                : 'bg-gray-300'
            }`} />
            
            {/* Timeline content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className={`text-sm font-medium ${
                  isCompleted(event.status) ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {STATUS_LABELS[event.status as keyof typeof STATUS_LABELS]}
                </h4>
                <span className={`text-xs ${
                  isCompleted(event.status) ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {formatTime(event.timestamp)}
                </span>
              </div>
              {event.description && (
                <p className={`text-xs mt-1 ${
                  isCompleted(event.status) ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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
  // ...existing code...
}

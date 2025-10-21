import { gql } from '@apollo/client';

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: String!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      message
      success
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: String!, $reason: String!) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      message
      success
    }
  }
`;

export const ASSIGN_RIDER = gql`
  mutation AssignRider($orderId: String!, $riderId: String!) {
    assignRider(orderId: $orderId, riderId: $riderId) {
      message
      success
    }
  }
`;

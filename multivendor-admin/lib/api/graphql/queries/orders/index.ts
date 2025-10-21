import { gql } from '@apollo/client';

export const GET_ORDERS = gql`
  query Orders($page: Int) {
    allOrders(page: $page) {
      _id
      orderId
      restaurant {
        _id
        name
        image
        address
        location {
          coordinates
        }
      }
      deliveryAddress {
        location {
          coordinates
        }
        deliveryAddress
        details
        label
      }
      items {
        _id
        title
        description
        image
        quantity
        variation {
          _id
          title
          price
          discounted
        }
        addons {
          _id
          options {
            _id
            title
            description
            price
          }
          description
          title
          quantityMinimum
          quantityMaximum
        }
        specialInstructions
        isActive
        createdAt
        updatedAt
      }
      user {
        _id
        name
        phone
        email
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      status
      paymentStatus
      reason
      isActive
      createdAt
      deliveryCharges
      tipping
      taxationAmount
      rider {
        _id
        name
        username
        available
      }
    }
  }
`;

export const GET_ORDER_BY_RESTAURANT_WITHOUT_PAGINATION = gql`
  query ordersByRestIdWithoutPagination($restaurant: String!, $search: String) {
    ordersByRestIdWithoutPagination(restaurant: $restaurant, search: $search) {
      _id
      orderId
      deliveryAddress {
        location {
          coordinates
        }
        deliveryAddress
        details
        label
      }
      items {
        _id
        title
        description
        image
        quantity
        variation {
          _id
          title
          price
          discounted
        }
        addons {
          _id
          options {
            _id
            title
            description
            price
          }
          description
          title
          quantityMinimum
          quantityMaximum
        }
        specialInstructions
        isActive
        createdAt
        updatedAt
      }
      user {
        _id
        name
        phone
        email
      }
      paymentMethod
      paidAmount
      orderAmount
      orderStatus
      status
      paymentStatus
      reason
      isActive
      createdAt
      deliveryCharges
      tipping
      taxationAmount
    }
  }
`;

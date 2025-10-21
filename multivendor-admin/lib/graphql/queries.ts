export const QUERY_USERS = /* GraphQL */ `
  query users {
    users { id name email }
  }
`;

export const QUERY_RESTAURANTS = /* GraphQL */ `
  query restaurants {
    restaurants { _id name address phone }
  }
`;

export const QUERY_MENU_ITEMS = /* GraphQL */ `
  query menuItems {
    menuItems { id restaurant_id name price }
  }
`;

export const QUERY_USERS_COUNT = /* GraphQL */ `
  query usersCount {
    usersCount
  }
`;

export const QUERY_RESTAURANTS_COUNT = /* GraphQL */ `
  query restaurantsCount {
    restaurantsCount
  }
`;

export const QUERY_MENU_ITEMS_COUNT = /* GraphQL */ `
  query menuItemsCount {
    menuItemsCount
  }
`;

export const QUERY_ORDERS = /* GraphQL */ `
  query orders($status: String, $page: Int, $limit: Int) {
    orders(status: $status, page: $page, limit: $limit) {
      orders {
        _id
        orderId
        user {
          id
          name
          email
        }
        restaurant {
          _id
          name
        }
        orderStatus
        paymentMethod
        paidAmount
        orderAmount
        deliveryCharges
        createdAt
        deliveryTime
        completedAt
      }
      total
    }
  }
`;

export const QUERY_ORDER = /* GraphQL */ `
  query order($id: ID!) {
    order(id: $id) {
      _id
      orderId
      user {
        id
        name
        email
      }
      restaurant {
        _id
        name
        address
        phone
      }
      items {
        id
        title
        quantity
        variation
        addons
        price
      }
      deliveryAddress {
        deliveryAddress
        latitude
        longitude
      }
      orderStatus
      paymentMethod
      paidAmount
      orderAmount
      deliveryCharges
      tipping
      taxationAmount
      createdAt
      deliveryTime
      completedAt
      reason
    }
  }
`;

export const QUERY_ORDERS_COUNT = /* GraphQL */ `
  query ordersCount($status: String) {
    ordersCount(status: $status)
  }
`;

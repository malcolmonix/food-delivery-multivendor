export const MUTATION_UPDATE_USER = /* GraphQL */ `
  mutation updateUser($id: ID!, $name: String!, $email: String!) {
    updateUser(id: $id, name: $name, email: $email) { id name email }
  }
`;

export const MUTATION_UPDATE_RESTAURANT = /* GraphQL */ `
  mutation updateRestaurant($id: ID!, $name: String!, $address: String!, $phone: String) {
    updateRestaurant(id: $id, name: $name, address: $address, phone: $phone) { _id name address phone }
  }
`;

export const MUTATION_UPDATE_ORDER_STATUS = /* GraphQL */ `
  mutation updateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      _id
      orderId
      orderStatus
      completedAt
    }
  }
`;

export const MUTATION_CANCEL_ORDER = /* GraphQL */ `
  mutation cancelOrder($id: ID!, $reason: String!) {
    cancelOrder(id: $id, reason: $reason) {
      _id
      orderId
      orderStatus
      reason
      completedAt
    }
  }
`;

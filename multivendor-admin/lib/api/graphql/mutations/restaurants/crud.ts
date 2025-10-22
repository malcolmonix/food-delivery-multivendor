import { gql } from '@apollo/client';

export const UPDATE_RESTAURANT = gql`
  mutation UpdateRestaurant($input: UpdateRestaurantInput!) {
    updateRestaurant(input: $input) {
      _id
      name
      image
      address
      phone
      orderPrefix
      slug
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      username
      tax
      shopType
      owner {
        _id
        email
        isActive
      }
    }
  }
`;

export const DELETE_RESTAURANT_SOFT = gql`
  mutation DeleteRestaurant($id: ID!) {
    deleteRestaurant(id: $id) {
      _id
      isActive
    }
  }
`;

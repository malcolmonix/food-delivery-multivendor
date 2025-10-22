import { gql } from '@apollo/client';

export const GET_RESTAURANTS_L = gql`
  query restaurants {
    restaurants {
      _id
    }
  }
`;

export const GET_RESTAURANTS_DROPDOWN = gql`
  query restaurants {
    restaurants {
      _id
      name
    }
  }
`;

export const GET_RESTAURANTS = gql`
  query restaurants {
    restaurants {
      unique_restaurant_id
      _id
      name
      image
      orderPrefix
      slug
      address
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      username
      tax
      owner {
        _id
        email
        isActive
      }
      shopType
    }
  }
`;

export const GET_CLONED_RESTAURANTS = gql`
  query getClonedRestaurants {
    getClonedRestaurants {
      _id
      name
      image
      username
      orderPrefix
      slug
      address
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      username
      tax
      owner {
        _id
        email
        isActive
      }
      shopType
    }
  }
`;

export const GET_RESTAURANTS_BY_OWNER = gql`
  query RestaurantByOwner($id: String) {
    restaurantByOwner(id: $id) {
      _id
      email
      userType
      restaurants {
        unique_restaurant_id
        _id
        orderId
        orderPrefix
        name
        slug
        image
        address
        isActive
        deliveryTime
        minimumOrder
        username
        password
        location {
          coordinates
        }
        deliveryInfo {
          minDeliveryFee
          deliveryDistance
          deliveryFee
        }
        openingTimes {
          day
          times {
            startTime
            endTime
          }
        }
        categories {
          _id
          title
          foods {
            _id
            title
          }
        }
        options {
          _id
          title
          description
          price
        }
        addons {
          _id
          title
          description
          quantityMinimum
          quantityMaximum
          options {
            _id
            title
            description
            price
          }
        }
        cuisines {
          _id
          name
          image
        }
        image
        logo
        isActive
        commissionRate
        tax
        shopType
        deliveryBounds {
          coordinates
        }
        location {
          coordinates
        }
        zone {
          _id
          title
        }
      }
    }
  }
`;

export const GET_RESTAURANT_BY_ID = gql`
  query GetRestaurant($id: String!) {
    getRestaurant(id: $id) {
      unique_restaurant_id
      _id
      orderId
      orderPrefix
      name
      slug
      image
      logo
      address
      deliveryTime
      minimumOrder
      isActive
      commissionRate
      username
      password
      tax
      owner {
        _id
        email
        isActive
      }
      shopType
      location {
        coordinates
      }
      deliveryBounds {
        coordinates
      }
      deliveryInfo {
        minDeliveryFee
        deliveryDistance
        deliveryFee
      }
      openingTimes {
        day
        times {
          startTime
          endTime
        }
      }
      categories {
        _id
        title
        foods {
          _id
          title
        }
      }
      options {
        _id
        title
        description
        price
      }
      addons {
        _id
        title
        description
        quantityMinimum
        quantityMaximum
        options {
          _id
          title
          description
          price
        }
      }
      cuisines {
        _id
        name
        image
      }
      zone {
        _id
        title
      }
      totalWalletAmount
      withdrawnWalletAmount
    }
  }
`;

export const GET_RESTAURANTS_PAGINATED = gql`
  query restaurantsPaginated($page: Int, $limit: Int, $search: String) {
    restaurantsPaginated(page: $page, limit: $limit, search: $search) {
      data {
        unique_restaurant_id
        _id
        name
        image
        orderPrefix
        slug
        address
        deliveryTime
        minimumOrder
        isActive
        commissionRate
        username
        tax
        owner {
          _id
          email
          isActive
        }
        shopType
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;

export const GET_CLONED_RESTAURANTS_PAGINATED = gql`
  query getClonedRestaurantsPaginated(
    $page: Int
    $limit: Int
    $search: String
  ) {
    getClonedRestaurantsPaginated(page: $page, limit: $limit, search: $search) {
      data {
        _id
        name
        image
        username
        orderPrefix
        slug
        address
        deliveryTime
        minimumOrder
        isActive
        commissionRate
        username
        tax
        owner {
          _id
          email
          isActive
        }
        shopType
      }
      totalCount
      currentPage
      totalPages
    }
  }
`;
export interface IRestaurantResponse {
  _id: string;
  unique_restaurant_id: string;
  name: string;
  image: string;
  logo?: string;
  orderPrefix: string;
  slug: string;
  address: string;
  phone?: string;
  deliveryTime: number;
  minimumOrder: number;
  isActive: boolean;
  commissionRate: number;
  tax: number;
  username: string;
  owner: {
    _id: string;
    email: string;
    isActive: boolean;
    __typename: string;
  };
  shopType: string;
  __typename: string;
}

// Updated to support pagination
export interface IPaginatedRestaurantResponse {
  data: IRestaurantResponse[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface IRestaurantsResponseGraphQL {
  restaurants?: IPaginatedRestaurantResponse;
  getClonedRestaurants?: IPaginatedRestaurantResponse;
  restaurantsPaginated?: IPaginatedRestaurantResponse;
  getClonedRestaurantsPaginated?: IPaginatedRestaurantResponse;
}

// Table header props with pagination
export interface IRestaurantsTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedActions: string[];
  setSelectedActions: (actions: string[]) => void;
}
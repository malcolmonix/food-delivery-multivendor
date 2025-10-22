// Queries
import { NEAR_BY_RESTAURANTS_PREVIEW } from "@/lib/api/graphql/queries";
// UseQuery
import { useQuery } from "@apollo/client";
// interface
import {
  INearByRestaurantsPreviewData,
  IRestaurant,
} from "../utils/interfaces/restaurants.interface";
// context
import { useUserAddress } from "../context/address/address.context";

const useNearByRestaurantsPreview = (
  enabled = true,
  page = 1,
  limit = 10,
  shopType?: "restaurant" | "grocery" | null // <-- 🔑 allow passing
) => {
  const { userAddress } = useUserAddress();
  // Default to Uyo if user location is not set
  // Uyo coordinates: longitude 7.9135, latitude 5.0389
  const DEFAULT_LONGITUDE = 7.9135;
  const DEFAULT_LATITUDE = 5.0389;
  const userLongitude = Number(userAddress?.location?.coordinates?.[0]);
  const userLatitude = Number(userAddress?.location?.coordinates?.[1]);
  const longitude = isNaN(userLongitude) || userLongitude === 0 ? DEFAULT_LONGITUDE : userLongitude;
  const latitude = isNaN(userLatitude) || userLatitude === 0 ? DEFAULT_LATITUDE : userLatitude;

  const { data, loading, error, networkStatus, fetchMore } =
    useQuery<INearByRestaurantsPreviewData>(NEAR_BY_RESTAURANTS_PREVIEW, {
      variables: {
        latitude,
        longitude,
        shopType: shopType ?? null, // 🔑 pass down if provided
        page,
        limit,
      },
      fetchPolicy: "cache-and-network",
      skip: !enabled,
      notifyOnNetworkStatusChange: true,
    });

  const queryData: IRestaurant[] =
    data?.nearByRestaurantsPreview?.restaurants ?? [];

  const groceriesData: IRestaurant[] =
    queryData?.filter(
      (item) => item?.shopType?.toLowerCase() === "grocery"
    ) ?? [];

  const restaurantsData: IRestaurant[] =
    queryData?.filter(
      (item) => item?.shopType?.toLowerCase() === "restaurant"
    ) ?? [];

  return {
    queryData,
    loading,
    error,
    networkStatus,
    groceriesData,
    restaurantsData,
    fetchMore, // expose for infinite scroll
  };
};

export default useNearByRestaurantsPreview;

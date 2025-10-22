import { useQuery } from "@apollo/client";
import { GET_AVAILABLE_LOCATIONS, IAvailableLocationsResponse } from "@/lib/api/graphql/queries";

export default function useAvailableLocations() {
  const { data, loading, error } = useQuery<IAvailableLocationsResponse>(GET_AVAILABLE_LOCATIONS, {
    fetchPolicy: "cache-and-network",
  });
  return { locations: data?.availableLocations ?? [], loading, error };
}

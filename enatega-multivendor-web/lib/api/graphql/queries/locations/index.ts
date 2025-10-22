import { gql } from "@apollo/client";

export const GET_AVAILABLE_LOCATIONS = gql`
  query AvailableLocations {
    availableLocations {
      id
      state
      city
      latitude
      longitude
      isAvailable
    }
  }
`;

export interface IServiceLocation {
  id: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  isAvailable: boolean;
}

export interface IAvailableLocationsResponse {
  availableLocations: IServiceLocation[];
}

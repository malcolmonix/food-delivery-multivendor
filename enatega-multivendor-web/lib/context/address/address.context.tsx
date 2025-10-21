"use client";

// Interfaces
import { IUserAddress, IUserAddressProps } from "@/lib/utils/interfaces";

// Core
import React, { ReactNode, useContext } from "react";

// Default location for Nigeria (Calabar, Cross River State)
const DEFAULT_NIGERIA_LOCATION: IUserAddress = {
  _id: "default-nigeria",
  label: "Cross River State",
  location: {
    coordinates: [8.3200, 5.0000], // [longitude, latitude] for Cross River State
  },
  deliveryAddress: "Cross River State, Nigeria",
  details: "Default location for Nigeria",
};

const UserAddressContext = React.createContext({} as IUserAddressProps);

export const UserAddressProvider = ({ children }: { children: ReactNode }) => {
  const [userAddress, setUserAddress] = React.useState<IUserAddress | null>(
    DEFAULT_NIGERIA_LOCATION
  );

  const value: IUserAddressProps = {
    userAddress,
    setUserAddress,
  };

  return (
    <UserAddressContext.Provider value={value}>
      {children}
    </UserAddressContext.Provider>
  );
};
export const ConfigurationConsumer = UserAddressContext.Consumer;
export const useUserAddress = () => useContext(UserAddressContext);

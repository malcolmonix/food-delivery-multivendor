"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@apollo/client";
import {
  GET_AVAILABLE_LOCATIONS,
  type IAvailableLocationsResponse,
  type IServiceLocation,
} from "@/lib/api/graphql/queries";
import { useUserAddress } from "@/lib/context/address/address.context";
import { USER_CURRENT_LOCATION_LS_KEY } from "@/lib/utils/constants";
import { onUseLocalStorage } from "@/lib/utils/methods/local-storage";

type Suggestion = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

const CitySearch: React.FC = () => {
  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hooks
  const t = useTranslations();
  const router = useRouter();
  const { setUserAddress } = useUserAddress();

  // Data
  const { data } = useQuery<IAvailableLocationsResponse>(
    GET_AVAILABLE_LOCATIONS,
    {
      fetchPolicy: "cache-first",
    }
  );

  const locations: IServiceLocation[] = data?.availableLocations ?? [];

  // State
  const [search, setSearch] = useState<string>("");
  const [filtered, setFiltered] = useState<Suggestion[]>([]);

  // Handlers
  const handleSelect = (item: Suggestion) => {
    const { label, latitude, longitude, id } = item;

    // Persist to local storage (shape used by rest of app)
    onUseLocalStorage(
      "save",
      USER_CURRENT_LOCATION_LS_KEY,
      JSON.stringify({
        label,
        location: { coordinates: [longitude, latitude] as [number, number] },
        _id: id,
        deliveryAddress: label,
      })
    );

    // Update address context
    setUserAddress({
      _id: id,
      label,
      location: { coordinates: [longitude, latitude] as [number, number] },
      deliveryAddress: label,
      details: "Selected from available locations",
    });

    // Navigate to discovery and reset
    router.push("/discovery");
    setSearch("");
    setFiltered([]);
  };

  // Filter suggestions when search text changes
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered([]);
      return;
    }

    const items: Suggestion[] = locations
      .filter((l) => l.isAvailable)
      .filter((l) => {
        const label = `${l.city}, ${l.state}`.toLowerCase();
        return label.includes(q) || l.city.toLowerCase().includes(q) || l.state.toLowerCase().includes(q);
      })
      .map((l) => ({
        id: String(l.id),
        label: `${l.city}, ${l.state}`,
        latitude: l.latitude,
        longitude: l.longitude,
      }));

    setFiltered(items);
  }, [search, locations]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFiltered([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="w-full max-w-md mx-auto p-2 rounded-md relative">
      <div className="flex justify-center items-center gap-4 rounded-full bg-white p-4 border-2 border-transparent hover:border-[#7dd24f] ">
        <i className="pi pi-map-marker" style={{ fontSize: "1.5rem", color: "black" }} />
        <input
          ref={inputRef}
          type="text"
          placeholder={t("searchCity")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-md focus:outline-none focus:ring-0 hover:outline-none hover:ring-0 border-none"
        />
      </div>

      {filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-10 bg-white border rounded-md shadow-md">
          {filtered.map((suggestion) => (
            <div className="flex gap-2 p-2 items-center" key={suggestion.id}>
              <i
                className="pi pi-map-marker"
                style={{ fontSize: "1.3rem", color: "black", backgroundColor: "#ededee", padding: "6px", borderRadius: "50%" }}
              />
              <div className="w-full flex ">
                <li onClick={() => handleSelect(suggestion)} className=" hover:text-[#94e469] px-5 hover:cursor-pointer">
                  {suggestion.label}
                </li>
                <hr />
              </div>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CitySearch;

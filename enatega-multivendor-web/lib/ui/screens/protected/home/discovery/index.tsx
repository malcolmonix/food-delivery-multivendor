"use client";
import {
  DiscoveryBannerSection,
  RestaurantsNearYou,
  MostOrderedRestaurants,
  GroceryList,
  TopGroceryPicks,
  TopRatedVendors,
  PopularRestaurants,
  PopularStores,
  OrderItAgain,
  CommingSoonScreen,
} from "@/lib/ui/screen-components/protected/home";
import dynamic from "next/dynamic";
import RandomFoodBanner from "@/lib/ui/useable-components/RandomFoodBanner";
// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import("@/app/(localized)/mapview/[slug]/components/Map"), { ssr: false });
// ui componnet
import CuisinesSection from "@/lib/ui/useable-components/cuisines-section";
// hooks
import useGetCuisines from "@/lib/hooks/useGetCuisines";
import useNearByRestaurantsPreview from "@/lib/hooks/useNearByRestaurantsPreview";
import useMostOrderedRestaurants from "@/lib/hooks/useMostOrderedRestaurants";

export default function DiscoveryScreen() {
  const { restaurantCuisinesData, groceryCuisinesData, error, loading } =
    useGetCuisines();

  const {
    queryData,
    loading: mostOrderedLoading,
    error: mostorderedError,
  } = useMostOrderedRestaurants(true, 1, 6);

  const {
    loading: restaurantsLoading,
    queryData: restaurantsNearYou,
    restaurantsData,
    groceriesData,
    error: restaurantsError,
  } = useNearByRestaurantsPreview(true, 1, 6);

  // Show loader/skeleton while fetching
  if (loading && restaurantsLoading) {
    return (
      <>
        <DiscoveryBannerSection />
        <OrderItAgain />
        <MostOrderedRestaurants
          data={queryData}
          loading={mostOrderedLoading}
          error={!!mostorderedError}
        />
        <CuisinesSection
          title="Restaurant-cuisines"
          data={restaurantCuisinesData}
          loading={loading || restaurantsLoading}
          error={!!error}
        />
        <RestaurantsNearYou
          data={restaurantsNearYou}
          loading={restaurantsLoading}
          error={!!restaurantsError}
        />
        <CuisinesSection
          title="Grocery-cuisines"
          data={groceryCuisinesData}
          loading={loading || restaurantsLoading}
          error={!!error}
        />
        <GroceryList
          data={groceriesData}
          loading={restaurantsLoading}
          error={!!restaurantsError}
        />
        <TopGroceryPicks
          // // data={MostOrderedRestaurantsGroceryData}
          // loading={mostOrderedLoading}
          // error={!!mostorderedError}
        />
        <TopRatedVendors />
        <PopularRestaurants />
        <PopularStores />
      </>
    );
  }

  // // Show ComingSoon only after loading is complete and data is confirmed empty
  if (
    restaurantsData.length === 0 &&
    groceriesData.length === 0 &&
    !loading &&
    !restaurantsLoading
  ) {
    return <CommingSoonScreen />;
  }

  return (
    <div className="container-fluid px-0">
      {/* Modern random food banner */}
      <RandomFoodBanner />
      {/* Modernized main banner carousel */}
      <div className="mb-4">
        <DiscoveryBannerSection />
      </div>
      {/* Map view for city vendors (Uyo, Calabar) */}
      <div className="mb-4">
        <h2 className="h4 fw-bold mb-3">Vendors in Your City (Uyo, Calabar)</h2>
        {/* Example: pass city and data props as needed */}
        <div style={{ minHeight: 400, borderRadius: 12, overflow: 'hidden' }}>
          <Map apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''} data={restaurantsNearYou || []} center={null} />
        </div>
      </div>
      <OrderItAgain />
      <MostOrderedRestaurants
        data={queryData}
        loading={mostOrderedLoading}
        error={!!mostorderedError}
      />
      <CuisinesSection
        title="Restaurant-cuisines"
        data={restaurantCuisinesData}
        loading={loading || restaurantsLoading}
        error={!!error}
      />
      <RestaurantsNearYou
        data={restaurantsNearYou}
        loading={restaurantsLoading}
        error={!!restaurantsError}
      />
      <CuisinesSection
        title="Grocery-cuisines"
        data={groceryCuisinesData}
        loading={loading || restaurantsLoading}
        error={!!error}
      />
      <GroceryList
        data={groceriesData}
        loading={restaurantsLoading}
        error={!!restaurantsError}
      />
      <TopGroceryPicks />
      <TopRatedVendors />
      <PopularRestaurants />
      <PopularStores />
    </div>
  );
}

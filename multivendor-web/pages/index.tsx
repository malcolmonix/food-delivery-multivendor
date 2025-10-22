import React from 'react';
import { gql } from '@apollo/client';
import client from '../lib/apolloClient';
import RandomFoodBanner from '../components/RandomFoodBanner';
import Link from 'next/link';
import LocationPicker from '../components/LocationPicker';
import { USER_CURRENT_LOCATION_LS_KEY } from '../components/CitySearch';
import styles from '../styles/Home.module.css';
import gridStyles from '../styles/HomeGrid.module.css';

const NEAR_BY_RESTAURANTS_PREVIEW = gql`
  fragment RestaurantPreviewFields on RestaurantPreview {
    _id
    name
    image
    logo
    slug
    shopType
    deliveryTime
    location { coordinates }
    reviewAverage
    cuisines
    isAvailable
    isActive
  }
  query Restaurants($latitude: Float, $longitude: Float, $page: Int, $limit: Int, $shopType: String, $city: String, $state: String) {
    nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit, shopType: $shopType, city: $city, state: $state) {
      restaurants { ...RestaurantPreviewFields }
    }
  }
`;

// Backward-compatible query (for servers that don't accept city/state args)
const NEAR_BY_RESTAURANTS_PREVIEW_BASE = gql`
  fragment RestaurantPreviewFieldsBase on RestaurantPreview {
    _id
    name
    image
    logo
    slug
    shopType
    deliveryTime
    location { coordinates }
    reviewAverage
    cuisines
    isAvailable
    isActive
  }
  query RestaurantsBase($latitude: Float, $longitude: Float, $page: Int, $limit: Int, $shopType: String) {
    nearByRestaurantsPreview(latitude: $latitude, longitude: $longitude, page: $page, limit: $limit, shopType: $shopType) {
      restaurants { ...RestaurantPreviewFieldsBase }
    }
  }
`;

type RestaurantPreview = {
  _id: string;
  name: string;
  cuisines?: string[];
  image?: string;
  slug?: string;
};

const DEFAULT_LATITUDE = 5.0333; // Uyo
const DEFAULT_LONGITUDE = 7.9333;

export default function Home() {
  const [where, setWhere] = React.useState<{ lat: number; lng: number }>({ lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE });
  const [selectedCity, setSelectedCity] = React.useState<string | undefined>(undefined);
  const [selectedState, setSelectedState] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [restaurants, setRestaurants] = React.useState<RestaurantPreview[]>([]);
  const [searchText, setSearchText] = React.useState('');
  // no need to show location chip anymore; keep localStorage usage, but drop chip UI
  const [page, setPage] = React.useState(1);
  const limit = 24;
  const [hasMore, setHasMore] = React.useState(true);

  const fetchRestaurants = React.useCallback(
    async (lat: number, lng: number, pageArg = 1, append = false, cityArg?: string, stateArg?: string) => {
      if (append) setLoadingMore(true); else setLoading(true);
      setError(null);
      try {
        let res = await client.query<{ nearByRestaurantsPreview?: { restaurants?: RestaurantPreview[] } }>({
          query: NEAR_BY_RESTAURANTS_PREVIEW,
          variables: { latitude: lat, longitude: lng, page: pageArg, limit, city: cityArg, state: stateArg },
          fetchPolicy: 'network-only',
        });
        const list = res?.data?.nearByRestaurantsPreview?.restaurants ?? [];
        setHasMore(list.length === limit);
        if (append) {
          setRestaurants((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            const merged = [...prev, ...list.filter((n) => !ids.has(n._id))];
            return merged;
          });
        } else {
          setRestaurants(list);
        }
      } catch (e) {
        // Fallback: try base query without city/state when server doesn't support those args or returns 400
        const err = e as any;
        const msg: string = err?.message || '';
        const networkStatus = err?.networkError?.statusCode || err?.statusCode;
        const graphQLErrors: Array<{ message?: string }> = err?.graphQLErrors || err?.networkError?.result?.errors || [];
        const messages = [msg, ...graphQLErrors.map((g) => g?.message || '')].join(' \n ');
        const isArgError = /Unknown argument\s+\"(city|state)\"/i.test(messages) || /Cannot query field\s+\"nearByRestaurantsPreview\"/i.test(messages);
        const isGeneric400 = Number(networkStatus) === 400;
        if (isArgError || isGeneric400) {
          try {
            const res2 = await client.query<{ nearByRestaurantsPreview?: { restaurants?: RestaurantPreview[] } }>({
              query: NEAR_BY_RESTAURANTS_PREVIEW_BASE,
              variables: { latitude: lat, longitude: lng, page: pageArg, limit },
              fetchPolicy: 'network-only',
            });
            const list2 = res2?.data?.nearByRestaurantsPreview?.restaurants ?? [];
            setHasMore(list2.length === limit);
            if (append) {
              setRestaurants((prev) => {
                const ids = new Set(prev.map((p) => p._id));
                const merged = [...prev, ...list2.filter((n) => !ids.has(n._id))];
                return merged;
              });
            } else {
              setRestaurants(list2);
            }
            return;
          } catch (e2) {
            setError(e2 as Error);
          }
        } else {
          setError(err as Error);
        }
      } finally {
        if (append) setLoadingMore(false); else setLoading(false);
      }
    },
    [limit]
  );

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_CURRENT_LOCATION_LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const coords = parsed?.location?.coordinates as [number, number] | undefined;
        if (coords && coords.length === 2) {
          setWhere({ lat: coords[1], lng: coords[0] });
        }
        const label = parsed?.deliveryAddress || parsed?.label || '';
        if (label) {
          const parts = String(label).split(',').map((s) => s.trim());
          if (parts.length >= 2) {
            setSelectedCity(parts[0]);
            setSelectedState(parts.slice(1).join(', '));
          }
        }
      }
    } catch {}
  }, []);

  // Fetch whenever location or selected city/state changes
  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchRestaurants(where.lat, where.lng, 1, false, selectedCity, selectedState);
  }, [where.lat, where.lng, selectedCity, selectedState, fetchRestaurants]);

  const handleLoadMore = React.useCallback(() => {
    const next = page + 1;
    setPage(next);
    fetchRestaurants(where.lat, where.lng, next, true, selectedCity, selectedState);
  }, [page, where.lat, where.lng, selectedCity, selectedState, fetchRestaurants]);

  const filtered = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => {
      const name = (r.name || '').toLowerCase(); // vendor
      const slug = (r.slug || '').toLowerCase(); // branch proxy
      const meals = (r.cuisines || []).join(' ').toLowerCase(); // meal proxy
      return name.includes(q) || slug.includes(q) || meals.includes(q);
    });
  }, [restaurants, searchText]);

  return (
    <div className={styles.homeContainer}>
      <div className={gridStyles.bannerWrap}>
        <RandomFoodBanner />
        <div className={gridStyles.lpFloat}>
          <LocationPicker
            variant="compact"
            onLocationSelect={(s) => {
              const parts = String(s.label || '').split(',').map((p) => p.trim());
              const city = parts[0] || undefined;
              const state = parts.length >= 2 ? parts.slice(1).join(', ') : undefined;
              setWhere({ lat: s.latitude, lng: s.longitude });
              setSelectedCity(city);
              setSelectedState(state);
              setPage(1);
              setHasMore(true);
              fetchRestaurants(s.latitude, s.longitude, 1, false, city, state);
            }}
          />
        </div>
      </div>

      <div className={gridStyles.header}>
        <div className={gridStyles.searchWrapper}>
          <span className={gridStyles.searchIcon} aria-hidden>🔎</span>
          <input
            className={gridStyles.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search vendors, branches, meals"
          />
        </div>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div style={{ color: '#ef4444' }}>Error: {error.message}</div>
      ) : filtered.length === 0 ? (
        <div>No restaurants found for the selected location.</div>
      ) : (
        <>
          <ul className={gridStyles.grid}>
            {filtered.map((r) => (
              <li key={r._id} className={gridStyles.card}>
                <Link href={`/restaurant/${encodeURIComponent(r._id)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.image ? (
                    <img src={r.image} alt={r.name} className={gridStyles.thumb} />
                  ) : null}
                  <div className={gridStyles.cardBody}>
                    <div className={gridStyles.cardTitle}>{r.name}</div>
                    <div style={{ color: '#6b7280', fontSize: 12 }}>{(r.cuisines || []).join(', ')}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {hasMore && (
            <div className={gridStyles.loadMoreWrap}>
              <button className={gridStyles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

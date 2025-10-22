import React from 'react';
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import client from '../../lib/apolloClient';
import RestaurantHero from '../../components/RestaurantHero';
import { useCart } from '../../lib/context/cart.context';

// Conservative base query first (avoid unsupported fields like 'logo')
const GET_RESTAURANT_AND_MENU_BASE = gql`
  query RestaurantWithMenuBase($id: ID!) {
    restaurant(id: $id) {
      _id
      name
      image
      address
      phone
    }
    menuItemsByRestaurant(restaurantId: $id) {
      id
      name
      price
    }
  }
`;

// Optional extended query that includes 'logo' where supported
const GET_RESTAURANT_AND_MENU = gql`
  query RestaurantWithMenu($id: ID!) {
    restaurant(id: $id) {
      _id
      name
      image
      logo
      address
      phone
    }
    menuItemsByRestaurant(restaurantId: $id) {
      id
      name
      price
    }
  }
`;

// Fallback when menuItemsByRestaurant resolver is missing; filter client-side
const GET_ALL_MENU_ITEMS = gql`
  query AllMenuItems {
    menuItems {
      id
      restaurant_id
      name
      price
    }
  }
`;

export default function RestaurantPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { addItem, count, total, state } = useCart();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [restaurant, setRestaurant] = React.useState<{ _id: string; name: string; image?: string; logo?: string; address?: string; phone?: string } | null>(null);
  const [items, setItems] = React.useState<Array<{ id: string; name: string; price: number }>>([]);

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        // Try base (safe) query first
        const res = await client.query<{ restaurant: any; menuItemsByRestaurant: Array<{ id: string; name: string; price: number }> }>(
          {
            query: GET_RESTAURANT_AND_MENU_BASE,
            variables: { id },
            fetchPolicy: 'network-only',
          }
        );
        if (!mounted) return;
        setRestaurant(res.data?.restaurant || null);
        setItems(res.data?.menuItemsByRestaurant || []);
      } catch (e: any) {
        // Fallbacks: try extended query (if base failed for other reasons), then generic menuItems list
        const message: string = e?.message || '';
        const gqlErrors: Array<{ message?: string }> = e?.graphQLErrors || e?.networkError?.result?.errors || [];
        const messages = [message, ...gqlErrors.map((g) => g?.message || '')].join(' \n ');
        const isMenuItemsUnknown = /Cannot query field\s+"menuItemsByRestaurant"|Unknown field\s+"menuItemsByRestaurant"/i.test(messages);
        try {
          // Try extended query (adds 'logo') in case base failed for reasons unrelated to selection set
          const res2 = await client.query<{ restaurant: any; menuItemsByRestaurant: Array<{ id: string; name: string; price: number }> }>(
            {
              query: GET_RESTAURANT_AND_MENU,
              variables: { id },
              fetchPolicy: 'network-only',
            }
          );
          if (!mounted) return;
          setRestaurant(res2.data?.restaurant || null);
          setItems(res2.data?.menuItemsByRestaurant || []);
        } catch (e2: any) {
          const msg2: string = e2?.message || '';
          const gqlErrors2: Array<{ message?: string }> = e2?.graphQLErrors || e2?.networkError?.result?.errors || [];
          const messages2 = [msg2, ...gqlErrors2.map((g) => g?.message || '')].join(' ');
          const menuUnknown2 = isMenuItemsUnknown || /Cannot query field\s+"menuItemsByRestaurant"|Unknown field\s+"menuItemsByRestaurant"/i.test(messages2);

          if (menuUnknown2) {
            try {
              const res3 = await client.query<{ menuItems: Array<{ id: string; restaurant_id: string; name: string; price: number }> }>(
                { query: GET_ALL_MENU_ITEMS, fetchPolicy: 'network-only' }
              );
              if (!mounted) return;
              const all = res3?.data?.menuItems || [];
              const filtered = all.filter(mi => String(mi.restaurant_id) === String(id)).map(mi => ({ id: mi.id, name: mi.name, price: mi.price }));
              setItems(filtered);
              // If restaurant query failed, leave existing state; at minimum we show items
              if (!restaurant) setRestaurant({ _id: String(id), name: 'Restaurant', image: undefined, address: undefined, phone: undefined });
            } catch (e3) {
              if (!mounted) return;
              setError(e3 as Error);
            }
          } else {
            if (!mounted) return;
            setError(e2 as Error);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [id]);

  if (!id) return <div>Loading…</div>;
  if (loading) return <div>Loading…</div>;
  if (error) return <div style={{ color: '#ef4444' }}>Error: {error.message}</div>;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', paddingBottom: 24 }}>
      <RestaurantHero
        name={restaurant?.name || 'Restaurant'}
        bannerImage={restaurant?.image}
        logo={restaurant?.logo}
        address={restaurant?.address}
        phone={restaurant?.phone}
      />
      <div style={{ padding: '0 16px' }}>
        <button onClick={() => router.back()} style={{ margin: '8px 0 16px' }}>← Back</button>

      <h2 style={{ margin: '16px 0' }}>Menu</h2>
        {items.length === 0 ? (
          <div>No menu items available.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {items.map((mi) => (
              <li key={mi.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 12, background: '#fff' }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>{mi.name}</div>
                <div style={{ color: '#6b7280', marginBottom: 10 }}>₦{mi.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <button
                  onClick={() => addItem(String(restaurant?._id || id), restaurant?.name || 'Restaurant', { id: String(mi.id), title: mi.name, price: mi.price, quantity: 1 })}
                  style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}
                >
                  Add to cart
                </button>
              </li>
            ))}
          </ul>
        )}
        {count > 0 && state.restaurantId === String(restaurant?._id || id) && (
          <div style={{ position: 'sticky', bottom: 12, display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <a href="/checkout" style={{ background: '#22c55e', color: '#fff', padding: '12px 16px', borderRadius: 999, textDecoration: 'none' }}>
              View cart ({count}) · ₦{total.toLocaleString(undefined, { maximumFractionDigits: 0 })} → Checkout
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

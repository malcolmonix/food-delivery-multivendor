import React from 'react';
import { useRouter } from 'next/router';
import { gql } from '@apollo/client';
import client from '../../lib/apolloClient';
import { useCart } from '../../lib/cart';

const GET_RESTAURANT_AND_MENU = gql`
  query RestaurantWithMenu($id: ID!) {
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

export default function RestaurantPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { addItem, count, total, state } = useCart();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [restaurant, setRestaurant] = React.useState<{ _id: string; name: string; image?: string; address?: string; phone?: string } | null>(null);
  const [items, setItems] = React.useState<Array<{ id: string; name: string; price: number }>>([]);

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await client.query<{ restaurant: any; menuItemsByRestaurant: Array<{ id: string; name: string; price: number }> }>(
          {
            query: GET_RESTAURANT_AND_MENU,
            variables: { id },
            fetchPolicy: 'network-only',
          }
        );
        if (!mounted) return;
        setRestaurant(res.data?.restaurant || null);
        setItems(res.data?.menuItemsByRestaurant || []);
      } catch (e) {
        if (!mounted) return;
        setError(e as Error);
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
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <button onClick={() => router.back()} style={{ marginBottom: 12 }}>← Back</button>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        {restaurant?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={restaurant.image} alt={restaurant.name} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12 }} />
        ) : null}
        <div>
          <h1 style={{ margin: '4px 0' }}>{restaurant?.name || 'Restaurant'}</h1>
          <div style={{ color: '#6b7280' }}>{restaurant?.address}</div>
          {restaurant?.phone ? (
            <div style={{ color: '#6b7280' }}>📞 {restaurant.phone}</div>
          ) : null}
        </div>
      </div>

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
  );
}

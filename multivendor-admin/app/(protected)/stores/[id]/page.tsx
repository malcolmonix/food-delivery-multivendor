"use client";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadUser } from '@/lib/utils/auth';
import { getClient } from '@/lib/graphql/client';
import { QUERY_MENU_ITEMS, QUERY_RESTAURANTS } from '@/lib/graphql/queries';

interface Store { _id: string; name: string; address: string; phone?: string | null }
interface MenuItem { id: string; name: string; price: number; restaurant_id: string }

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [store, setStore] = useState<Store | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = loadUser();
    if (!u?.token) { router.replace('/authentication/login'); return; }
    if (!id) return;

    (async () => {
      setLoading(true); setError(null);
      try {
        const client = await getClient();
        const [r, mi] = await Promise.all([
          client.request<{ restaurants: Store[] }>(QUERY_RESTAURANTS),
          client.request<{ menuItems: MenuItem[] }>(QUERY_MENU_ITEMS),
        ]);
        const s = (r.restaurants || []).find(x => x._id === id) || null;
        setStore(s);
        setItems((mi.menuItems || []).filter(m => m.restaurant_id === id));
      } catch (e: any) { setError(e?.message || 'Failed to load store'); }
      finally { setLoading(false); }
    })();
  }, [router, id]);

  const totalItems = items.length;
  const avgPrice = useMemo(() => items.length ? items.reduce((a,b)=>a + (b.price||0),0)/items.length : 0, [items]);

  return (
    <main className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">{store?.name || 'Store'}</h1>
        <p className="text-sm opacity-70 mt-1">{store?.address} {store?.phone ? `· ${store.phone}` : ''}</p>
      </header>

      {loading && <div className="opacity-70">Loading…</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}

      {!loading && !error && store && (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded border border-white/10 p-4">
              <div className="text-sm opacity-70">Menu Items</div>
              <div className="text-3xl font-semibold mt-1">{totalItems}</div>
            </div>
            <div className="rounded border border-white/10 p-4">
              <div className="text-sm opacity-70">Average Price</div>
              <div className="text-3xl font-semibold mt-1">${avgPrice.toFixed(2)}</div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Items</h2>
            <div className="overflow-x-auto rounded border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(m => (
                    <tr key={m.id} className="border-t border-white/10">
                      <td className="p-2">{m.name}</td>
                      <td className="p-2">${m.price.toFixed(2)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={2} className="p-4 opacity-70">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser } from '@/lib/utils/auth';
import { getClient } from '@/lib/graphql/client';
import { QUERY_MENU_ITEMS, QUERY_RESTAURANTS } from '@/lib/graphql/queries';
import Link from 'next/link';

type MenuItem = { id: string; name: string; price: number; restaurant_id: string };
interface Store { _id: string; name: string }

export default function MenuItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = loadUser();
    if (!u?.token) { router.replace('/authentication/login'); return; }

    (async () => {
      setLoading(true); setError(null);
      try {
        const client = await getClient();
        const [mi, r] = await Promise.all([
          client.request<{ menuItems: MenuItem[] }>(QUERY_MENU_ITEMS),
          client.request<{ restaurants: Store[] }>(QUERY_RESTAURANTS),
        ]);
        setItems(mi.menuItems || []);
        setStores(r.restaurants || []);
      } catch (e: any) { setError(e?.message || 'Failed to load menu items'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const storeName = useMemo(() => Object.fromEntries(stores.map(s => [s._id, s.name])), [stores]);
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter(m => [m.name, String(m.price), storeName[m.restaurant_id] || ''].some(x => (x||'').toLowerCase().includes(s)));
  }, [items, q, storeName]);

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menu Items</h1>
          <p className="text-sm opacity-70 mt-1">Browse and search menu items.</p>
        </div>
        <input className="rounded border border-white/10 bg-transparent p-2" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
      </header>

      {loading && <div className="opacity-70">Loading…</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto rounded border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Store</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-t border-white/10">
                  <td className="p-2">{m.name}</td>
                  <td className="p-2">${m.price.toFixed(2)}</td>
                  <td className="p-2">
                    {storeName[m.restaurant_id] ? (
                      <Link className="underline" href={`/stores/${m.restaurant_id}`}>{storeName[m.restaurant_id]}</Link>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-4 opacity-70">No items</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

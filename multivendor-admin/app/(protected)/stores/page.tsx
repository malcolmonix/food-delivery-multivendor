"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser } from '@/lib/utils/auth';
import { getClient } from '@/lib/graphql/client';
import { QUERY_RESTAURANTS } from '@/lib/graphql/queries';

interface Store { _id: string; name: string; address: string; phone?: string | null }

export default function StoresPage() {
  const router = useRouter();
  const [data, setData] = useState<Store[]>([]);
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
        const res = await client.request<{ restaurants: Store[] }>(QUERY_RESTAURANTS);
        setData(res.restaurants || []);
      } catch (e: any) { setError(e?.message || 'Failed to load stores'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return data.filter(r => [r.name, r.address, r.phone || '', r._id].some(x => (x||'').toLowerCase().includes(s)));
  }, [data, q]);

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stores</h1>
          <p className="text-sm opacity-70 mt-1">Search and manage stores.</p>
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
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Phone</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id} className="border-t border-white/10">
                  <td className="p-2">{r._id}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2">{r.address}</td>
                  <td className="p-2">{r.phone || '-'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="p-4 opacity-70">No stores</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

"use client";
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadUser } from '@/lib/utils/auth';
import { getClient } from '@/lib/graphql/client';

// Using users for vendors for now; can be changed to actual owners when backend exposes it
interface Vendor { id: string; name: string; email: string }

const QUERY_VENDORS = /* GraphQL */ `
  query users { users { id name email } }
`;

export default function VendorsPage() {
  const router = useRouter();
  const [data, setData] = useState<Vendor[]>([]);
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
        const res = await client.request<{ users: Vendor[] }>(QUERY_VENDORS);
        setData(res.users || []);
      } catch (e: any) { setError(e?.message || 'Failed to load vendors'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return data.filter(v => [v.name, v.email, v.id].some(x => (x||'').toLowerCase().includes(s)));
  }, [data, q]);

  return (
    <main className="p-6 space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-sm opacity-70 mt-1">Manage vendors/owners.</p>
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
                <th className="text-left p-2">Email</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id} className="border-t border-white/10">
                  <td className="p-2">{v.id}</td>
                  <td className="p-2">{v.name}</td>
                  <td className="p-2">{v.email}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} className="p-4 opacity-70">No vendors</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

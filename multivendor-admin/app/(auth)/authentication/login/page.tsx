"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveUser } from '@/lib/utils/auth';
import { getClient } from '@/lib/graphql/client';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('password');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const query = /* GraphQL */ `
      mutation ownerLogin($email: String!, $password: String!) {
        ownerLogin(email: $email, password: $password) {
          userId
          token
          email
          userType
        }
      }
    `;
    
    try {
      const client = await getClient();
      const data = await client.request<{ ownerLogin: any }>(query, { email, password });
      const user = data?.ownerLogin;
      if (user?.token) {
        saveUser(user);
        router.replace('/dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-700 bg-transparent p-2"
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-gray-700 bg-transparent p-2"
          placeholder="Password"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-white/10 hover:bg-white/20 py-2"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
  {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </main>
  );
}

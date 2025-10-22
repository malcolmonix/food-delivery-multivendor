// This file checks backend connectivity on app load and logs status in the browser console.

const GRAPHQL_URL = process.env.NEXT_PUBLIC_SERVER_URL
  ? process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '') + '/graphql'
  : 'http://localhost:4000/graphql';

export async function checkBackendConnection() {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ __typename }' })
    });
    if (res.ok) {
      // Backend is up (does not guarantee DB, but backend is reachable)
      // You can enhance this by using a real query if needed
      // eslint-disable-next-line no-console
      console.log(`Connected to backend at ${GRAPHQL_URL}`);
    } else {
      // eslint-disable-next-line no-console
      console.error(`Backend at ${GRAPHQL_URL} responded with status ${res.status}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Could not connect to backend at ${GRAPHQL_URL}:`, err);
  }
}

// Optionally, run on import (or import and call in _app.tsx or layout.tsx)
if (typeof window !== 'undefined') {
  checkBackendConnection();
}

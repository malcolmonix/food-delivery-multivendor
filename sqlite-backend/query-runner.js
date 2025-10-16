const url = 'http://127.0.0.1:4000/graphql';
const query = '{ admins { id email name role } }';

async function waitForServer(retries = 20, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      if (res.ok) return res;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, delayMs));
  }
  throw new Error('Server not reachable');
}

(async () => {
  try {
    const res = await waitForServer();
    const json = await res.json();
    console.log('GraphQL response:');
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Error querying GraphQL:', err.message);
    process.exit(2);
  }
})();

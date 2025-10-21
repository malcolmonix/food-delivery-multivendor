const GQL_URL = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') || 'http://localhost:4001';

async function main() {
  const res = await fetch(`${GQL_URL}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ __schema { queryType { fields { name } } mutationType { fields { name } } } }' }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });

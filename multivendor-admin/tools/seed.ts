type GQLResp<T> = { data?: T; errors?: Array<{ message: string }> };

const SEED_GQL_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000/').replace(/\/$/, '') + '/graphql';

async function gql<T>(query: string, variables?: Record<string, any>) {
  const res = await fetch(SEED_GQL_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as GQLResp<T>;
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join('; '));
  return json.data as T;
}

async function hasField(root: 'query' | 'mutation', name: string) {
  const q = `{ __schema { ${root}Type { fields { name } } } }`;
  const data = await gql<{ __schema: { [k: string]: { fields: { name: string }[] } } }>(q);
  const fields = (data as any)?.__schema?.[`${root}Type`]?.fields || [];
  return fields.some((f: any) => f.name === name);
}

async function main() {
  const canCreateUser = await hasField('mutation', 'createUser').catch(() => false);
  const canCreateRestaurant = await hasField('mutation', 'createRestaurant').catch(() => false);

  // Fallback: if no mutations, exit gracefully
  if (!canCreateUser && !canCreateRestaurant) {
    console.log('No create mutations exposed. Seeding via GraphQL is not supported by this backend.');
    console.log('Consider adding createUser/createRestaurant mutations or seed via SQL.');
    return;
  }

  if (canCreateUser) {
    console.log('Seeding users...');
    const MU = /* GraphQL */ `
      mutation($name: String!, $email: String!) {
        createUser(name: $name, email: $email) { id name email }
      }
    `;
    for (const u of [
      { name: 'Alice Admin', email: 'alice@example.com' },
      { name: 'Bob Buyer', email: 'bob@example.com' },
      { name: 'Cathy Customer', email: 'cathy@example.com' },
    ]) {
      try { await gql(MU, u); console.log('✓ user', u.email); } catch (e: any) { console.log('• user skip', u.email, '-', e.message); }
    }
  }

  if (canCreateRestaurant) {
    console.log('Seeding restaurants...');
    const MR = /* GraphQL */ `
      mutation($name: String!, $address: String!, $phone: String) {
        createRestaurant(name: $name, address: $address, phone: $phone) { _id name }
      }
    `;
    for (const r of [
      { name: 'Pasta Place', address: '101 Main St', phone: '111-111-1111' },
      { name: 'Sushi Spot', address: '202 Elm St', phone: '222-222-2222' },
      { name: 'Taco Town', address: '303 Oak Ave', phone: '333-333-3333' },
    ]) {
      try { await gql(MR, r); console.log('✓ restaurant', r.name); } catch (e: any) { console.log('• restaurant skip', r.name, '-', e.message); }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

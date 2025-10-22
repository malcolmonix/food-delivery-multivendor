import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '') + '/graphql',
  }),
  cache: new InMemoryCache(),
});

export default client;

import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
  Operation,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const APP_NAME = 'multivendor-admin';

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  const cache = new InMemoryCache();

  // Backend URL - using port 4000 as per PORT-POLICY.md
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000/';

  const httpLink = createHttpLink({
    uri: `${serverUrl}graphql`,
  });

  // Error Handling Link
  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) {
      console.error('Network Error:', networkError);
    }

    if (graphQLErrors) {
      graphQLErrors.forEach((error) =>
        console.error('GraphQL Error:', error.message)
      );
    }
  });

  const request = async (operation: Operation): Promise<void> => {
    const data = localStorage.getItem(`user-${APP_NAME}`);
    let token = '';
    if (data) {
      token = JSON.parse(data).token;
    }

    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
  };

  // Request Link
  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle: any;
        Promise.resolve(operation)
          .then((oper) => request(oper))
          .then(() => {
            handle = forward(operation).subscribe({
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            });
          })
          .catch(observer.error.bind(observer));

        return () => {
          if (handle) handle.unsubscribe();
        };
      })
  );

  const client = new ApolloClient({
    link: concat(
      ApolloLink.from([errorLink, requestLink]),
      httpLink
    ),
    cache,
    connectToDevTools: true,
  });

  return client;
};

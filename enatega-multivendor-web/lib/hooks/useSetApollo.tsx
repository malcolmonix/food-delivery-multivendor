// Environment
// import getEnv from "@/environment";

// Apollo
import {
  ApolloClient,
  ApolloLink,
  concat,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
  Operation,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error"; // Import onError utility
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

// GQL
import { SubscriptionClient } from "subscriptions-transport-ws";

// Utility imports
import { Subscription } from "zen-observable-ts";
// import { ENV } from "../utils/constants";

export const useSetupApollo = (): ApolloClient<NormalizedCacheObject> => {
  // const { SERVER_URL, WS_SERVER_URL } = getEnv(ENV);
  // Provide sensible local defaults for development so the app can point to the
  // local sqlite GraphQL backend without changing production env files.
  const envServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const envWsUrl = process.env.NEXT_PUBLIC_WS_SERVER_URL;

  const isDev = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost';

  const SERVER_URL = envServerUrl && envServerUrl.length > 0
    ? envServerUrl
    : (isDev ? 'http://localhost:4000/' : '');

  const WS_SERVER_URL = envWsUrl && envWsUrl.length > 0
    ? envWsUrl
    : (isDev ? 'ws://localhost:4000/' : '');

  const cache = new InMemoryCache();

  const httpLink = createHttpLink({
    uri: `${SERVER_URL}graphql`,
    // useGETForQueries: true, 
  });

  // WebSocketLink with error handling
  const wsLink = new WebSocketLink(
    new SubscriptionClient(`${WS_SERVER_URL}graphql`, {
      reconnect: true,
      timeout: 30000,
      lazy: true,
    })
  );

  // Error Handling Link using ApolloLink's onError (for network errors)
  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (networkError) {
      console.error("Network Error:", networkError);
    }

    if (graphQLErrors) {
      (graphQLErrors || [])?.forEach((error) => {
        console.error("GraphQL Error:", error?.message);
        if (error.extensions?.code === "UNAUTHENTICATED") {
          if (typeof window !== "undefined") {
            localStorage.clear();
            sessionStorage.clear();
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }
        }
      });
    }
  });

  const request = async (operation: Operation): Promise<void> => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    operation.setContext({
      headers: {
        authorization: (token ?? "") ? `Bearer ${token ?? ""}` : "",
        userId: userId ?? "",
        isAuth: !!token,
        "X-Client-Type": "web"
      },
    });
  };

  // Request Link
  const requestLink = new ApolloLink(
    (operation, forward) =>
      new Observable((observer) => {
        let handle: Subscription | undefined;
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

  // Terminating Link for split between HTTP and WebSocket
  const terminatingLink = split(({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  }, wsLink);

  const client = new ApolloClient({
    link: concat(
      ApolloLink.from([errorLink, terminatingLink, requestLink]),
      httpLink
    ),
    cache,
    connectToDevTools: true,
  });

  return client;
};

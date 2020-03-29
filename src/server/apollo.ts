import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
import { GraphQLError, GraphQLFormattedError } from "graphql";
// import { RedisCache } from "apollo-server-cache-redis";
import { InMemoryLRUCache } from "apollo-server-caching";

export const createApolloServer = ({
  typeDefs,
  resolvers,
  context,
  dataSources,
  tracing,
  debug,
}: ApolloServerExpressConfig): ApolloServer => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    tracing,
    debug,
    dataSources,
    // cache: new RedisCache({
    //   host: 'redis-server',
    //   // Options are passed through to the Redis client
    // }),
    cache: new InMemoryLRUCache(),
    formatError: (error: GraphQLError): GraphQLFormattedError => {
      console.log(error);
      return error;
    },
  });
  return server;
};

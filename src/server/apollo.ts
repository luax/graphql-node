import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
import { GraphQLError, GraphQLFormattedError } from "graphql";
// import { RedisCache } from "apollo-server-cache-redis";
import { InMemoryLRUCache } from "apollo-server-caching";

export const createApolloServer = ({
  typeDefs,
  resolvers,
  context,
  dataSources,
}: ApolloServerExpressConfig): ApolloServer => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    tracing: process.env.NODE_ENV === "development",
    debug: process.env.NODE_ENV === "development",
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

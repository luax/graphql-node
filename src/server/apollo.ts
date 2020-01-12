import { ApolloServer, ApolloServerExpressConfig } from "apollo-server-express";
// import { GraphQLResponse } from "apollo-server-types";

export const createApolloServer = ({
  typeDefs,
  resolvers,
  context,
}: ApolloServerExpressConfig): ApolloServer => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    tracing: process.env.NODE_ENV === "development",
  });
  return server;
};

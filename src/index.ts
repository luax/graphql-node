import { createApolloServer, startServer } from "./server";
import { config } from "dotenv";
config();

import postgres from "./postgres";
postgres.initialize();

import { context } from "./lib";
import { typeDefs, resolvers, dataSources } from "./graph";

const apolloServer = createApolloServer({
  typeDefs,
  resolvers,
  dataSources,
  context,
});
startServer(apolloServer);

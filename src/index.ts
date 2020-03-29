// Do some setup first (environment variables etc)
import "./setup";

// The other imports can be in any order
import { createApolloServer, createExpressServer } from "src/server";
import { config, databaseSettings } from "./config";

import postgres from "./postgres";
postgres.initialize(databaseSettings);

import { context } from "./lib";
import { typeDefs, resolvers, dataSources } from "src/graphql";
import rest from "./rest";

const start = async (): Promise<void> => {
  const apolloServer = createApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context,
  });
  const { app } = await createExpressServer({
    apolloServer,
    port: config.PORT,
    startupMessage: true,
    environment: config.NODE_ENV,
  });
  rest(app);
};

start();

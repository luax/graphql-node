import { createApolloServer, createExpressServer } from "src/server";
import { config } from "dotenv";
config();

import postgres from "./postgres";
postgres.initialize();

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
  const { app } = await createExpressServer(apolloServer);
  rest(app);
};

start();

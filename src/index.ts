import { createApolloServer, startServer } from "./server";
import { config } from "dotenv";
config();

import { client } from "./postgres";
client.initialize();

import graphql from "./graphql";
const apolloServer = createApolloServer(graphql);
startServer(apolloServer);

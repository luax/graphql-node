import express from "express";
import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import net from "net";
import { ApolloServer } from "apollo-server-express";

const getUrl = ({ address, port }: net.AddressInfo): string => {
  let host = address;
  if (address === "" || address === "::") host = "localhost";
  return `http://${host}:${port}/`;
};

const setupExpress = (): express.Application => {
  const app = express();
  app.use(compression());
  app.use(helmet());
  app.use(cors());
  app.get("/", (_req, res) => {
    res.send("Hello World!");
  });
  return app;
};

export type ServerInfo = {
  url: string;
  server: net.Server;
  apolloServer: ApolloServer;
  app: express.Application;
};

export const startServer = async (
  apolloServer: ApolloServer,
): Promise<ServerInfo> => {
  const app = setupExpress();
  apolloServer.applyMiddleware({ app });
  // eslint-disable-next-line
  const httpServer = await app.listen({
    port: process.env.PORT,
  });
  const address = httpServer.address() as net.AddressInfo;
  const url = getUrl(address);
  if (process.env.NODE_ENV !== "test") {
    console.log(`🚀  Server ready at ${url} (env "${process.env.NODE_ENV}")`);
    console.log(`Health check at: ${url}.well-know./interface/server-health`);
  }
  return { url, server: httpServer, apolloServer, app };
};

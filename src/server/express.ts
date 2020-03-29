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
  return app;
};

export type ServerInfo = {
  url: string;
  server: net.Server;
  apolloServer: ApolloServer;
  app: express.Application;
};

export const createExpressServer = async ({
  apolloServer,
  port,
  startupMessage,
  environment,
}: {
  apolloServer: ApolloServer;
  port: number;
  startupMessage?: boolean;
  environment?: string;
}): Promise<ServerInfo> => {
  return new Promise(resolve => {
    const app = setupExpress();
    apolloServer.applyMiddleware({ app });
    const httpServer = app.listen(port, (): void => {
      const address = httpServer.address() as net.AddressInfo;
      const url = getUrl(address);
      if (startupMessage) {
        console.log(`🚀  Server ready at ${url} (env "${environment}")`);
        console.log(
          `Health check at: ${url}.well-know./interface/server-health`,
        );
      }
      resolve({ url, server: httpServer, apolloServer, app });
    });
  });
};

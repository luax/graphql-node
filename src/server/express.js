const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");

const getUrl = ({ address, port }) => {
  let host = address;
  if (address === "" || address === "::") host = "localhost";
  return `http://${host}:${port}/`;
};

const setupExpress = () => {
  const app = express();
  app.use(compression());
  app.use(helmet());
  app.use(cors());
  app.get("/", (_req, res) => {
    res.send("Hello World!");
  });
  return app;
};

const startServer = async apolloServer => {
  const app = setupExpress();
  apolloServer.applyMiddleware({ app });
  const httpServer = await app.listen({
    port: process.env.PORT,
  });
  const url = getUrl(httpServer.address());
  console.log(`🚀  Server ready at ${url} (env "${process.env.NODE_ENV}")`);
  console.log(`Health check at: ${url}/.well-known/apollo/server-health`);
  return { url, server: httpServer, apolloServer, app };
};

module.exports = {
  startServer,
};

const { ApolloServer } = require("apollo-server");
const { typeDefs, resolvers, context } = require("./graphql");
const { formatError } = require("./graphql/errors");

const createServer = ({ typeDefs, resolvers, context }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    formatError,
    formatResponse: response => {
      return response;
    },
    tracing: process.env.NODE_ENV === "development",
    onHealthCheck: () =>
      new Promise((resolve, reject) => {
        const healthy = true;
        if (healthy) {
          resolve();
        } else {
          reject(new Error());
        }
      }),
  });
  return server;
};

const startServer = async () => {
  const server = createServer({ typeDefs, resolvers, context });
  const httpServer = await server.listen({
    port: process.env.PORT,
  });
  console.log(
    `🚀  Server ready at ${httpServer.url} (env "${process.env.NODE_ENV}")`,
  );
  console.log(
    `Health check at: ${httpServer.url}.well-known/apollo/server-health`,
  );
  return httpServer;
};

module.exports = {
  createServer,
  startServer,
};

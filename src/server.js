const { ApolloServer } = require("apollo-server");
const { typeDefs, resolvers, context } = require("./graphql");

const createServer = ({ typeDefs, resolvers, context }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    formatError: error => {
      if (process.env.NODE_ENV !== "test") console.log("error", error);
      return error;
    },
    formatResponse: response => {
      return response;
    },
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
  return httpServer;
};

module.exports = {
  createServer,
  startServer,
};

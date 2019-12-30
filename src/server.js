const { ApolloServer } = require("apollo-server");
const { typeDefs, resolvers } = require("./graphql");

const createServer = ({ typeDefs, resolvers }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // dataSources,
    // context,
  });
  return server;
};

const startServer = async () => {
  const server = createServer({ typeDefs, resolvers });
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

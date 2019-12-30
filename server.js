const { ApolloServer } = require("apollo-server");

const startServer = async ({ typeDefs, resolvers, dataSources, context }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources,
    context,
  });
  const { url, subscriptionsPath, server: httpServer } = await server.listen({
    port: process.env.PORT,
  });
  console.log(`🚀  Server ready at ${url} (env "${process.env.NODE_ENV}")`);
  return { url, subscriptionsPath, httpServer };
};

module.exports = { startServer };

const { ApolloServer } = require("apollo-server-express");

const formatError = err => {
  if (err.message.startsWith("Database Error: ")) {
    return new Error("Internal server error");
  }

  if (process.env.NODE_ENV !== "test") console.log("error", err);

  return err;
};

const formatResponse = response => response;

const onHealthCheck = () =>
  new Promise((resolve, reject) => {
    const healthy = true;
    if (healthy) {
      resolve();
    } else {
      reject(new Error());
    }
  });

const createApolloServer = ({ typeDefs, resolvers, context }) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    formatError,
    formatResponse,
    tracing: process.env.NODE_ENV === "development",
    onHealthCheck,
  });
  return server;
};

module.exports = {
  createApolloServer,
};

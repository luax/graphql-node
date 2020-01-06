const dotenv = require("dotenv");
dotenv.config();

const { client } = require("./postgres");
client.initialize();

const graphql = require("./graphql");
const { startServer, createApolloServer } = require("./server");

startServer(createApolloServer(graphql));

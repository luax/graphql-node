require("dotenv").config();

const { startServer } = require("./server");
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

startServer({ typeDefs, resolvers });

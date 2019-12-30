const merge = require("lodash.merge");
const { AuthenticationError } = require("./errors")
const Query = require("./Query");
const Book = require("./Book");
const User = require("./User");

const typeDefs = [Query.typeDefs, Book.typeDefs];
const resolvers = merge(Query.resolvers, Book.resolvers);
const context = async ({ req })=> {
  const user = User.getUser(req);
  if (!user)
    throw new AuthenticationError("you must be logged in to query this schema");
  console.log("user authenticated", user);
  return {
    loaders: merge(Book.loaders(user)),
  };
};

module.exports = {
  typeDefs,
  resolvers,
  context,
};

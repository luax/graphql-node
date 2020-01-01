const merge = require("lodash.merge");
const { AuthenticationError } = require("./errors");
const Query = require("./Query");
const Book = require("./Book");
const User = require("./User");
const Author = require("./Author");

const typeDefs = [
  Query.typeDefs,
  Author.typeDefs,
  Book.typeDefs,
];

const resolvers = merge(
  Query.resolvers,
  Author.resolvers,
  Book.resolvers,
);

const context = async ({ req }) => {
  const user = User.getUser(req);
  if (!user)
    throw new AuthenticationError("you must be logged in to query this schema");
  return {
    // Create new loaders per request
    loaders: merge(Book.loaders(user), Author.loaders(user)),
  };
};

module.exports = {
  typeDefs,
  resolvers,
  context,
};

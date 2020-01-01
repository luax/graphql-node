const merge = require("lodash.merge");
const context = require("./context");
const Query = require("./Query");
const Book = require("./Book");
const getUser = require("./getUser");
const Author = require("./Author");

const typeDefs = [Query.typeDefs, Author.typeDefs, Book.typeDefs];

const resolvers = merge(Query.resolvers, Author.resolvers, Book.resolvers);

const models = { Book, Author };

const loaders = () => merge(Book.loaders(), Author.loaders());

module.exports = {
  typeDefs,
  resolvers,
  loaders,
  models,
  context: context(getUser, models, loaders),
};

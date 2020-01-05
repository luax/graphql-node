const merge = require("lodash.merge");
const context = require("./context");
const Root = require("./Root");
const Book = require("./Book");
const User = require("./User");
const Author = require("./Author");

const typeDefs = [Root.typeDefs, Author.typeDefs, Book.typeDefs, User.typeDefs];

const resolvers = merge(Author.resolvers, Book.resolvers, User.resolvers);

const models = { Book, Author, User };

const loaders = () => merge(Book.loaders(), Author.loaders());

module.exports = {
  typeDefs,
  resolvers,
  loaders,
  models,
  context: context(User.getUser, models, loaders),
};

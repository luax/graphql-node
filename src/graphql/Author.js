const DataLoader = require("dataloader");
const { AuthenticationError } = require("./errors");
const { client } = require("../postgres");
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Author {
    id: ID!
    name: String
    books: [Book]
  }
  extend type Query {
    author(id: ID!): Author
  }
`;

const isAuthorized = (user, _p) => user !== null;

const resolvers = {
  Query: {
    author: async (_, { id }, { user, loaders }, _info) => {
      const author = loaders.authors.getById.load(id);
      if (!isAuthorized(user, author)) {
        throw new AuthenticationError("not authenticated");
      }
      return author;
    },
  },
  Author: {
    books: async (author, _, { user, loaders }, _info) => {
      if (!isAuthorized(user, author)) {
        throw new AuthenticationError("not authenticated");
      }
      const books = await loaders.books.getByAuthorId.load(author.id);
      return books;
    },
  },
};

const serializeAuthor = record => ({
  id: record.id.toString(),
  name: record.name,
});

const loaders = () => ({
  authors: {
    getById: new DataLoader(async ids => {
      const res = await client.query(
        `SELECT id, name FROM authors WHERE id = ANY ($1) ORDER BY id ASC`,
        [ids],
      );
      const authors = res.map(r => serializeAuthor(r));
      return ids.map(id => authors.find(p => p.id === id));
    }),
  },
});

module.exports = { typeDefs, resolvers, loaders, isAuthorized };

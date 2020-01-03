const DataLoader = require("dataloader");
const groupBy = require("lodash.groupby");
const { AuthenticationError } = require("./errors");
const { client } = require("../postgres");
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Book {
    id: ID!
    title: String
    author: Author
  }
  extend type Query {
    books: [Book]
    book(id: ID!): Book
  }
`;

const resolvers = {
  Query: {
    books: async () =>
      await client.query(
        "SELECT id, title, author_id FROM books ORDER BY id ASC",
      ),
    book: (_obj, { id }, context, _info) =>
      context.loaders.books.getById.load(id),
  },
  Book: {
    author: (book, _, { user, loaders, models }, _info) => {
      if (!isAuthorized(user)) {
        throw new AuthenticationError("buu");
      }
      const author = loaders.authors.getById.load(book.author_id);
      if (!models.Author.isAuthorized(user)) {
        // TODO: Is this nice?
        throw new AuthenticationError("buu");
      }
      return author;
    },
  },
};

const isAuthorized = user => user !== null;

const loaders = () => ({
  books: {
    getById: new DataLoader(async ids => {
      const res = await client.query(
        "SELECT id, title, author_id FROM books WHERE id = ANY ($1) ORDER BY id ASC",
        [ids],
      );
      return ids.map(id => res.find(b => b.id == id));
    }),
    getByAuthorId: new DataLoader(async ids => {
      const books = await client.query(
        "SELECT id, title, author_id FROM books WHERE author_id = ANY ($1) ORDER BY id ASC",
        [ids],
      );
      const booksByAuthor = groupBy(books, "author_id");
      return ids.map(authorId => booksByAuthor[authorId]);
    }),
  },
});

module.exports = { typeDefs, resolvers, loaders, isAuthorized };

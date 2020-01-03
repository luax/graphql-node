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

const isAuthorized = user => user !== null;

const serializeBook = record => ({
  id: record.id.toString(),
  title: record.title,
  authorId: record.author_id.toString(),
});

const resolvers = {
  Query: {
    books: async () => {
      const res = await client.query(
        "SELECT id, title, author_id FROM books ORDER BY id ASC",
      );
      const books = res.map(r => serializeBook(r));
      return books;
    },
    book: (_obj, { id }, context, _info) =>
      context.loaders.books.getById.load(id),
  },
  Book: {
    author: (book, _args, { user, loaders, models }, _info) => {
      if (!isAuthorized(user)) {
        throw new AuthenticationError("buu");
      }
      const author = loaders.authors.getById.load(book.authorId);
      if (!models.Author.isAuthorized(user)) {
        // TODO: Is this nice?
        throw new AuthenticationError("buu");
      }
      return author;
    },
  },
};

const loaders = () => ({
  books: {
    getById: new DataLoader(async ids => {
      const res = await client.query(
        "SELECT id, title, author_id FROM books WHERE id = ANY ($1) ORDER BY id ASC",
        [ids],
      );
      const books = res.map(r => serializeBook(r));
      return ids.map(id => books.find(b => b.id === id));
    }),
    getByAuthorId: new DataLoader(async ids => {
      const res = await client.query(
        "SELECT id, title, author_id FROM books WHERE author_id = ANY ($1) ORDER BY id ASC",
        [ids],
      );
      const books = res.map(r => serializeBook(r));
      const booksByAuthor = groupBy(books, "authorId");
      return ids.map(authorId => booksByAuthor[authorId]);
    }),
  },
});

module.exports = { typeDefs, resolvers, loaders, isAuthorized };

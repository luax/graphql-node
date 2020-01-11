const { dataloader } = require("../dataloader");
const { AuthenticationError } = require("./errors");
const { client, sql } = require("../postgres");
const { gql } = require("apollo-server");
const requestedColumns = require("./requestedColumns");
const groupBy = require("lodash.groupby");

const typeDefs = gql`
  type Book implements Node {
    id: ID!
    title: String
    author: Author
  }

  type BookEdge implements Edge {
    node: Book!
    cursor: String!
  }

  type BookConnection implements Connection {
    edges: [BookEdge]!
    nodes: [Book]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  extend type Query {
    books: [Book]
    book(id: ID!): Book
  }
`;

const isAuthorized = user => user !== null;

const serializeBook = record => ({
  id: record.id.toString(),
  authorId: record.author_id.toString(),
  title: record?.title,
});

const getRequestedColumns = requestedColumns(
  new Set(["id", "author_id"]),
  new Set(["title"]),
);

const resolvers = {
  Query: {
    books: async () => {
      const columns = client.columns(["id", "title", "author_id"]);
      const res = await client.query(
        sql`SELECT ${columns} FROM books ORDER BY id ASC`,
      );
      const books = res.map(r => serializeBook(r));
      return books;
    },
    book: (_obj, { id }, context, info) =>
      context.loaders.books.getById.load({
        id,
        columns: getRequestedColumns(info),
      }),
  },
  Book: {
    author: (book, _args, { user, loaders, models }, info) => {
      if (!isAuthorized(user)) {
        throw new AuthenticationError("buu");
      }
      const author = loaders.authors.getById.load({
        id: book.authorId,
        columns: models.Author.getRequestedColumns(info),
      });
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
    getById: dataloader(async (ids, columns) => {
      const sqlArray = sql.array(ids, "int4");
      const res = await client.query(
        sql`SELECT ${columns} FROM books WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      const books = res.map(r => serializeBook(r));
      return ids.map(id => books.find(b => b.id === id));
    }),
    getByAuthorId: dataloader(async (ids, columns) => {
      const sqlArray = sql.array(ids, "int4");
      const res = await client.query(
        sql`SELECT ${columns} FROM books WHERE author_id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      const books = res.map(r => serializeBook(r));
      const booksByAuthor = groupBy(books, "authorId");
      return ids.map(authorId => booksByAuthor[authorId]);
    }),
  },
});

module.exports = {
  typeDefs,
  resolvers,
  loaders,
  isAuthorized,
  serializeBook,
  getRequestedColumns,
};

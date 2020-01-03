const DataLoader = require("dataloader");
const { AuthenticationError, UserInputError } = require("./errors");
const { client } = require("../postgres");
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Author {
    id: ID!
    name: String
    books: [Book]
    booksConnection(
      """
      Returns the elements in the list that come after the specified cursor.
      """
      after: String

      """
      Returns the elements in the list that come before the specified cursor.
      """
      before: String

      """
      Returns the first _n_ elements from the list.
      """
      first: Int

      """
      Returns the last _n_ elements from the list.
      """
      last: Int
    ): BookConnection!
  }

  type PageInfo {
    # When paginating forwards, the cursor to continue.
    endCursor: String

    # When paginating forwards, are there more items?
    hasNextPage: Boolean!

    # When paginating backwards, are there more items?
    hasPreviousPage: Boolean!

    # When paginating backwards, the cursor to continue.
    startCursor: String
  }

  type BookEdge {
    cursor: String!
    node: Book!
  }

  # Paginated collection of Documents. As specified by:
  # https://facebook.github.io/relay/graphql/connections.htm
  type BookConnection {
    edges: [BookEdge]!
    pageInfo: PageInfo!
    totalCount: Int!
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
    booksConnection: async (
      author,
      { first = 0, last = 0, after = null, before = null },
      { user, models },
      _info,
    ) => {
      if (!isAuthorized(user, author)) {
        throw new AuthenticationError("not authenticated");
      }
      if (first < 0 || last < 0) {
        throw new Error("positive");
      }
      if (first <= 0 && last <= 0) {
        throw new UserInputError("first or last must be positive");
      }
      if (first > 0 && last > 0) {
        throw new Error("fool");
      }
      // TODO: defaults and upper limit
      const booksConnection = await models.Book.getBooksConnection(
        author,
        first,
        last,
        after,
        before,
      );
      return booksConnection;
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

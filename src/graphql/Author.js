const DataLoader = require("dataloader");
const BookConnection = require("./BookConnection");
const { AuthenticationError, UserInputError } = require("./errors");
const { client } = require("../postgres");
const { gql } = require("apollo-server");

const typeDefs = gql`
  type Author implements Node {
    id: ID!
    name: String
    books: [Book]
    booksConnection(input: ConnectionInput): BookConnection!
  }

  extend type Query {
    author(id: ID!): Author
  }

  input CreateAuthorInput {
    name: String!
  }

  input UpdateAuthorInput {
    id: ID!
    name: String!
  }

  type CreateAuthorMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    node: Author
  }

  type UpdateAuthorMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    node: Author
  }

  extend type Mutation {
    createAuthor(input: CreateAuthorInput!): CreateAuthorMutationResponse!
    updateAuthor(input: UpdateAuthorInput!): UpdateAuthorMutationResponse!
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
      { input: { first = 0, last = 0, after = null, before = null } },
      { user, models, loaders },
      _info,
    ) => {
      if (!isAuthorized(user, author)) {
        throw new AuthenticationError("not authenticated");
      }
      const isFirst = first > 0;
      const isLast = last > 0;
      if (first < 0 || last < 0) {
        throw new Error("positive");
      }
      if (!isFirst && !isLast) {
        throw new UserInputError("first or last must be positive");
      }
      if (isFirst && isLast) {
        throw new Error("fool");
      }
      const limit = first || last; // TODO: defaults and upper limit
      const beforeBook = before && (await loaders.books.getById.load(before));
      if (before && !beforeBook) {
        throw new UserInputError("bad before cursor");
      }
      const afterBook = after && (await loaders.books.getById.load(after));
      if (after && !afterBook) {
        throw new UserInputError("bad after cursor");
      }
      const connection = new BookConnection(author);
      const [edges, nodes] = await connection.getEdges(
        // TODO: Lazy load?
        beforeBook,
        afterBook,
        limit,
        isFirst,
        isLast,
      );
      edges.forEach(edge => {
        const book = edge.node;
        if (!models.Book.isAuthorized(user, book)) {
          throw new AuthenticationError("buu");
        }
      });
      return {
        totalCount: connection.getTotalCount,
        pageInfo: connection.getPageInfo(edges),
        edges,
        nodes,
      };
    },
  },
  Mutation: {
    createAuthor: async (_, { input: { _name } }, _context, _info) => {
      // TODO: ...
    },
    updateAuthor: async (_, { input: { _id, _name } }, _context, _info) => {
      // TODO: ...
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

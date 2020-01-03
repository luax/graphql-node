const DataLoader = require("dataloader");
const groupBy = require("lodash.groupby");
const { AuthenticationError, UserInputError } = require("./errors");
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

const getBooksConnection = async (author, first, last, after, before) => {
  const totalCountRes = await client.query(
    `SELECT count(*) as count FROM books WHERE author_id = $1`,
    [author.id],
  );
  const totalCount = totalCountRes[0].count;
  let beforeCursor = -1;
  if (before) {
    const beforeCursorRes = await client.query(
      `SELECT id as cursor FROM books WHERE author_id = $1 AND id = $2`,
      [author.id, before],
    );
    if (beforeCursorRes[0]) {
      beforeCursor = beforeCursorRes[0].cursor;
    } else {
      throw new UserInputError("bad before cursor");
    }
  }
  let afterCursor = -1;
  if (after) {
    const afterCursorRes = await client.query(
      `SELECT id as cursor FROM books WHERE author_id = $1 AND id = $2`,
      [author.id, after],
    );
    if (afterCursorRes[0]) {
      afterCursor = afterCursorRes[0].cursor;
    } else {
      throw new UserInputError("bad after cursor");
    }
  }
  if (!before && !after) {
    // TODO: ...
  }
  const limit = first || last;
  const res = await client.query(
    `
      SELECT
        *
      FROM
        (
          SELECT
            * -- TODO: Select columns
          FROM
            books
          WHERE
            author_id = $1 -- author id
            AND CASE
              WHEN $2 >= 0 AND $3 >= 0 THEN id < $2 AND id > $3 -- before and after
              WHEN $2 >= 0 THEN id < $2 -- before
              WHEN $3 >= 0 THEN id > $3 -- after
            END
          ORDER BY
            -- TODO: triple check that this ordering works as intended
            CASE WHEN $5 > 0 THEN id END ASC, -- first
            CASE WHEN $6 > 0 THEN id END DESC -- last
          LIMIT
            $4
        ) AS q
      ORDER BY
        id ASC
    `,
    [author.id, beforeCursor, afterCursor, limit, first, last],
  );
  const books = res.map(r => serializeBook(r));
  const edges = books.map(q => ({
    node: q,
    cursor: q.id,
  }));
  const startCursor = books.length > 0 ? books[0].id : null;
  const endCursor = books.length > 0 ? books[books.length - 1].id : null;
  // TODO: is has next/previous correct?
  const hasPreviousRes = await client.query(
    `SELECT 1 FROM books WHERE author_id = $1 AND id < $2 ORDER BY id ASC`,
    [author.id, startCursor],
  );
  const hasPreviousPage = hasPreviousRes.length > 0;
  const hasNextRes = await client.query(
    `SELECT 1 FROM books WHERE author_id = $1 AND id > $2 ORDER BY id ASC`,
    [author.id, endCursor],
  );
  const hasNextPage = hasNextRes.length > 0;
  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  return {
    totalCount,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
    },
    edges,
  };
};

module.exports = {
  typeDefs,
  resolvers,
  loaders,
  isAuthorized,
  getBooksConnection,
};

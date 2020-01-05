const { client } = require("../postgres");
const Book = require("./Book");

class BookConnection {
  constructor(author) {
    this.author = author;
  }

  getAuthor = () => this.author;

  getTotalCount = async () => {
    const totalCountRes = await client.query(
      `SELECT count(*) as count FROM books WHERE author_id = $1`,
      [this.getAuthor().id],
    );
    return totalCountRes[0].count;
  };

  getPageInfo = edges => {
    const firstEdge = edges[0];
    const lastEdge = edges[edges.length - 1];
    const startCursor = firstEdge ? firstEdge.cursor : null;
    const endCursor = lastEdge ? lastEdge.cursor : null;
    return {
      // TODO: is hasNext/hasPrevious correct?
      hasNextPage: async () => {
        const hasNextRes = await client.query(
          `SELECT 1 FROM books WHERE author_id = $1 AND id > $2 ORDER BY id ASC`,
          [this.getAuthor().id, endCursor],
        );
        return hasNextRes.length > 0;
      },
      hasPreviousPage: async () => {
        const hasPreviousRes = await client.query(
          `SELECT 1 FROM books WHERE author_id = $1 AND id < $2 ORDER BY id ASC`,
          [this.getAuthor().id, startCursor],
        );
        return hasPreviousRes.length > 0;
      },
      startCursor,
      endCursor,
    };
  };

  getEdges = async (
    beforeBook = null,
    afterBook = null,
    limit = 0,
    isFirst = false,
    isLast = false,
  ) => {
    const beforeCursor = beforeBook ? beforeBook.id : null;
    const afterCursor = afterBook ? afterBook.id : null;
    const res = await client.query(
      `
        SELECT
          *
        FROM
          (
            SELECT
              id,
              title,
              author_id
            FROM
              books
            WHERE
              author_id = $1 -- author id
              AND CASE
                WHEN $2 >= 0 AND $3 >= 0 THEN id < $2 AND id > $3 -- before and after cursor
                WHEN $2 >= 0 THEN id < $2 -- before cursor
                WHEN $3 >= 0 THEN id > $3 -- after cursor
                ELSE author_id = $1
              END
            ORDER BY
              -- TODO: triple check that this ordering works as intended
              CASE WHEN $5 IS true THEN id END ASC, -- first
              CASE WHEN $6 IS true THEN id END DESC -- last
            LIMIT
              $4
          ) AS q
        ORDER BY
          id ASC
      `,
      [this.getAuthor().id, beforeCursor, afterCursor, limit, isFirst, isLast],
    );
    const books = res.map(r => Book.serializeBook(r));
    const edges = books.map(book => ({
      node: book,
      cursor: book.id,
    }));
    return [edges, books];
  };
}

module.exports = BookConnection;

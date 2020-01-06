const Book = require("./Book");
const { client, sql } = require("../postgres");

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
        const authorId = this.getAuthor().id;
        const hasNextRes = await client.query(
          sql`SELECT 1 FROM books WHERE author_id = ${authorId} AND id > ${endCursor} ORDER BY id ASC`,
        );
        return hasNextRes.length > 0;
      },
      hasPreviousPage: async () => {
        const authorId = this.getAuthor().id;
        const hasPreviousRes = await client.query(
          sql`SELECT 1 FROM books WHERE author_id = ${authorId} AND id < ${endCursor} ORDER BY id ASC`,
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
    // TODO: Make more dynamic using slonik?
    const res = await client.query(
      sql`
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
              author_id = ${this.getAuthor().id}
              AND CASE
                WHEN ${beforeCursor} >= 0 AND ${afterCursor} >= 0 THEN id < ${beforeCursor} AND id > ${afterCursor}
                WHEN ${beforeCursor} >= 0 THEN id < ${beforeCursor}
                WHEN ${afterCursor} >= 0 THEN id > ${afterCursor}
                ELSE author_id = ${this.getAuthor().id}
              END
            ORDER BY
              -- TODO: triple check that this ordering works as intended
              CASE WHEN ${isFirst} IS true THEN id END ASC, -- first
              CASE WHEN ${isLast} IS true THEN id END DESC -- last
            LIMIT
              ${limit}
          ) AS q
        ORDER BY
          id ASC
      `,
    );
    // TODO: Use getBookById loader instead?
    const books = res.map(r => Book.serializeBook(r));
    const edges = books.map(book => ({
      node: book,
      cursor: book.id,
    }));
    return [edges, books];
  };
}

module.exports = BookConnection;

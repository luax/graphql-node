const { client, sql } = require("../postgres");

class BookConnection {
  constructor(author, getBookById) {
    this.author = author;
    this.getBookById = getBookById;
  }

  getTotalCount = async () => {
    const totalCountRes = await client.query(
      `SELECT count(*) as count FROM books WHERE author_id = $1`,
      [this.author.id],
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
        const authorId = this.author.id;
        const hasNextRes = await client.query(
          sql`SELECT 1 FROM books WHERE author_id = ${authorId} AND id > ${endCursor} ORDER BY id ASC`,
        );
        return hasNextRes.length > 0;
      },
      hasPreviousPage: async () => {
        const authorId = this.author.id;
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
    const beforeCursor = beforeBook?.id;
    const afterCursor = afterBook?.id;
    // TODO: Make more dynamic using slonik?
    const res = await client.query(
      sql`
        SELECT
          id
        FROM
          (
            SELECT
              id
            FROM
              books
            WHERE
              author_id = ${this.author.id}
              AND CASE
                WHEN ${beforeCursor} >= 0 AND ${afterCursor} >= 0 THEN id < ${beforeCursor} AND id > ${afterCursor}
                WHEN ${beforeCursor} >= 0 THEN id < ${beforeCursor}
                WHEN ${afterCursor} >= 0 THEN id > ${afterCursor}
                ELSE author_id = ${this.author.id}
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
    const books = await Promise.all(res.map(r => this.getBookById(r.id)));
    const edges = books.map(book => ({
      node: book,
      cursor: book.id,
    }));
    return [edges, books];
  };
}

module.exports = BookConnection;

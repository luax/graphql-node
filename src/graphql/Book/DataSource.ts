import { Book } from "./index";
import { client, sql, QueryResultRowType } from "../../postgres";
import DataLoader from "dataloader";
import SQLDataSource from "../datasources/SQLDataSource";
import { PaginationInput } from "../types";
import groupBy from "lodash/groupBy";
import memoize from "lodash/memoize";

class DataSource extends SQLDataSource<Book> {
  async getBooks(): Promise<Book[]> {
    const columns = client.columns(["id", "title", "author_id"]);
    const books = await this.query(
      sql`SELECT ${columns} FROM books ORDER BY id ASC`,
    );
    return books;
  }

  async getById(bookId: string): Promise<Book | undefined> {
    return this.getByIdLoader.load(bookId);
  }

  async getByAuthorId(authorId: string): Promise<(Book | undefined)[]> {
    return this.getByAuthorIdLoader.load(authorId);
  }

  async getIdsByPagination(input: PaginationInput): Promise<string[]> {
    return this.getIdsByPaginationMemoized(input);
  }

  deserialize = (rows: readonly QueryResultRowType<string>[]): Book[] => {
    return rows.map(row => ({
      id: row["id"].toString(),
      authorId: row["author_id"].toString(),
      title: row["title"] as string,
    }));
  };

  private getByIdLoader = new DataLoader(async (ids: readonly string[]) => {
    const columns = client.columns(["id", "title", "author_id"]);
    const sqlArray = sql.array(ids as string[], "int4");
    const books = await this.query(
      sql`SELECT ${columns} FROM books WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
    );
    return ids.map(id => books.find(p => p.id === id));
  });

  private getByAuthorIdLoader = new DataLoader(
    async (ids: readonly string[]) => {
      const columns = client.columns(["id", "title", "author_id"]);
      const sqlArray = sql.array(ids as string[], "int4");
      const books = await this.query(
        sql`SELECT ${columns} FROM books WHERE author_id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      const booksByAuthor = groupBy(books, "authorId");
      return ids.map(authorId => booksByAuthor[authorId]);
    },
  );

  private getIdsByPaginationMemoized = memoize(
    async input => {
      // TODO: Make more dynamic using slonik?
      const { primaryKey, limit, before, after, isFirst, isLast } = input;
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
                author_id = ${primaryKey}
                AND CASE
                  WHEN ${before} >= 0 AND ${after} >= 0 THEN id < ${before} AND id > ${after}
                  WHEN ${before} >= 0 THEN id < ${before}
                  WHEN ${after} >= 0 THEN id > ${after}
                  ELSE author_id = ${primaryKey}
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
      return res.map(o => o["id"].toString());
    },
    input =>
      Object.keys(input)
        .sort()
        .join("_"),
  );

  paginationHasNextPage = memoize(
    async (authorId, endCursor): Promise<boolean> => {
      const hasNextRes = await client.query(
        sql`SELECT 1 FROM books WHERE author_id = ${authorId} AND id > ${endCursor} ORDER BY id ASC`,
      );
      return hasNextRes.length > 0;
    },
    input =>
      Object.keys(input)
        .sort()
        .join("_"),
  );

  paginationHasPreviousPage = memoize(
    async (authorId, endCursor): Promise<boolean> => {
      const hasPreviousRes = await client.query(
        sql`SELECT 1 FROM books WHERE author_id = ${authorId} AND id < ${endCursor} ORDER BY id ASC`,
      );
      return hasPreviousRes.length > 0;
    },
    input =>
      Object.keys(input)
        .sort()
        .join("_"),
  );

  totalCountByAuthorId = memoize(
    async (authorId): Promise<number> => {
      const totalCountRes = await client.query(
        sql`SELECT count(*) as count FROM books WHERE author_id = ${authorId}`,
      );
      const count = totalCountRes[0]["count"] as number;
      return count;
    },
  );
}

export default DataSource;

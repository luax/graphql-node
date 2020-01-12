import {
  createPool,
  sql,
  DatabasePoolType,
  PrimitiveValueExpressionType,
  ListSqlTokenType,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from "slonik";

export { QueryResultRowType } from "slonik";

let init = false;
let pool: DatabasePoolType;

export default {
  columns: (columns: string[]): ListSqlTokenType =>
    sql.join(
      columns.map(column => sql.identifier([column])),
      sql`, `,
    ),
  query: async (
    query: TaggedTemplateLiteralInvocationType,
    params?: PrimitiveValueExpressionType[] | undefined,
  ): Promise<readonly QueryResultRowType<string>[]> => {
    const start = Date.now();
    const res = await pool.query(query, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log({
        query: {
          sql: query.sql,
          values: JSON.stringify(query.values),
        },
        duration,
        rows: res.rowCount,
      });
    }
    return res.rows;
  },
  initialize: (): void => {
    if (init) throw new Error("called initialize twice");
    init = true;
    pool = createPool(process.env.DATABASE_URL || "", {
      maximumPoolSize: 20,
      connectionTimeout: 2000,
    });
  },
  end: async (): Promise<void> => pool.end(),
};

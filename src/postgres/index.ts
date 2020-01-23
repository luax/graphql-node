import {
  createPool,
  DatabasePoolType,
  PrimitiveValueExpressionType,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from "slonik";

import sql from "./sql";
export { sql };

export {
  QueryResultRowType,
  TaggedTemplateLiteralInvocationType,
  ListSqlTokenType,
} from "slonik";

let init = false;
let pool: DatabasePoolType;

export default class Postgres {
  static async query(
    query: TaggedTemplateLiteralInvocationType,
    params?: PrimitiveValueExpressionType[] | undefined,
  ): Promise<readonly QueryResultRowType<string>[]> {
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
  }

  static initialize(): void {
    if (init) throw new Error("called initialize twice");
    init = true;
    pool = createPool(process.env.DATABASE_URL || "", {
      maximumPoolSize: 20,
      connectionTimeout: 2000,
    });
  }

  static async end(): Promise<void> {
    await pool.end();
  }
}

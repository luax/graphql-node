import {
  createPool,
  DatabasePoolType,
  PrimitiveValueExpressionType,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
  ConnectionContextType,
  DatabasePoolConnectionType,
  InterceptorType,
} from "slonik";

import sql from "./sql";
export { sql };

export {
  QueryResultRowType,
  TaggedTemplateLiteralInvocationType,
  ListSqlTokenType,
} from "slonik";

export interface SettingsType {
  databaseUrl: string;
  name: string;
  logSql?: boolean;
}

let init = false;
let logQueries = false;
let pool: DatabasePoolType;

export default class Postgres {
  static async query(
    query: TaggedTemplateLiteralInvocationType,
    params?: PrimitiveValueExpressionType[] | undefined,
  ): Promise<readonly QueryResultRowType<string>[]> {
    const start = Date.now();
    const res = await pool.query(query, params);
    const duration = Date.now() - start;
    if (logQueries) {
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

  static initialize(settings: SettingsType): void {
    if (init) throw new Error("called initialize twice");
    init = true;

    const interceptors: InterceptorType[] = [
      {
        async afterPoolConnection(
          _connectionContext: ConnectionContextType,
          connection: DatabasePoolConnectionType,
        ): Promise<null> {
          await connection.query(sql`SET application_name = 'graphql-node'`);
          await connection.query(sql`SET statement_timeout = '2s'`);
          return null;
        },
      },
    ];

    const poolSettings = {
      ...settings,
      interceptors,
    };

    logQueries = Boolean(settings.logSql);
    pool = createPool(settings.databaseUrl, poolSettings);
  }

  static async end(): Promise<void> {
    await pool.end();
  }
}

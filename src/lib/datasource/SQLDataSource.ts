import DataSource from "./DataSource";
import postgres, {
  QueryResultRowType,
  TaggedTemplateLiteralInvocationType,
} from "../../postgres";
import { Context } from "../types";

export { QueryResultRowType };

abstract class SQLDataSource<TContext extends Context, T> extends DataSource<
  TContext,
  T
> {
  abstract deserializeQueryResult(
    rows: readonly QueryResultRowType<string>[],
  ): T[];

  keyPrefix = "sql_";

  async query(query: TaggedTemplateLiteralInvocationType): Promise<T[]> {
    const res = await this.queryRaw(query);
    return this.deserializeQueryResult(res);
  }

  // eslint-disable-next-line
  async queryRaw(
    query: TaggedTemplateLiteralInvocationType,
  ): Promise<readonly QueryResultRowType<string>[]> {
    // TODO use db from context
    const res = await postgres.query(query);
    return res;
  }
}

export default SQLDataSource;

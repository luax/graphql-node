import DataSource from "./DataSource";
import postgres, {
  QueryResultRowType,
  TaggedTemplateLiteralInvocationType,
} from "src/postgres";
import { Context, DBModel } from "src/lib/types";
import { GraphQLResolveInfo } from "graphql";

export { QueryResultRowType };

abstract class SQLDataSource<
  TContext extends Context,
  T extends DBModel
> extends DataSource<TContext, T> {
  // TODO: Some caching
  keyPrefix = "sql_";

  abstract idColumns: Set<string>;

  abstract columns: Set<string>;

  abstract selectFields: (info: GraphQLResolveInfo) => string[];

  abstract deserializeQueryResult(
    rows: readonly QueryResultRowType<string>[],
  ): T[];

  async query(query: TaggedTemplateLiteralInvocationType): Promise<T[]> {
    const res = await this.queryRaw(query);
    return this.deserializeQueryResult(res);
  }

  // eslint-disable-next-line class-methods-use-this
  async queryRaw(
    query: TaggedTemplateLiteralInvocationType,
  ): Promise<readonly QueryResultRowType<string>[]> {
    // TODO use db from context
    const res = await postgres.query(query);
    return res;
  }
}

export default SQLDataSource;

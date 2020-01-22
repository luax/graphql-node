import DataSource from "./DataSource";
import { client } from "../../postgres";
import {
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from "slonik";

abstract class SQLDataSource<T> extends DataSource<T> {
  abstract deserializeQueryResult(
    rows: readonly QueryResultRowType<string>[],
  ): T[];

  keyPrefix = "sql_";

  async query(query: TaggedTemplateLiteralInvocationType): Promise<T[]> {
    const res = await client.query(query);
    return this.deserializeQueryResult(res);
  }
}

export default SQLDataSource;

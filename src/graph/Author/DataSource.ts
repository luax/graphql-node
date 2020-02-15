import { Author } from "./index";
import DataLoader from "dataloader";
import { enhancedDataLoader, SQLDataSource } from "../../lib/datasource";
import { sql, QueryResultRowType } from "../../postgres";
import { selectedFields } from "../../lib/graphql";
import { AppContext } from "../types";
import { GraphQLResolveInfo } from "graphql";
import { ListSqlTokenType } from "slonik";

class DataSource extends SQLDataSource<AppContext, Author> {
  async getById(authorId: string): Promise<Author | undefined> {
    return this.getByIdLoader.load(authorId);
  }

  async getByIdTest(
    authorId: string,
    info: GraphQLResolveInfo,
  ): Promise<Author | undefined> {
    const fields = this.selectedFields(info);
    return this.getByIdEnhanchedLoader.load({ id: authorId, columns: fields });
  }

  idColumns = new Set(["id"]);

  columns = new Set(["id", "name"]);

  selectedFields = selectedFields(this.idColumns, this.columns);

  serialize = (author: Author): string =>
    JSON.stringify({
      id: author.id,
      title: author.name,
    });

  deserializeQueryResult = (
    rows: readonly QueryResultRowType<string>[],
  ): Author[] => {
    return rows.map(row => ({
      id: row["id"].toString(),
      name: row["name"] as string,
    }));
  };

  private getByIdLoader = new DataLoader(async (ids: readonly string[]) => {
    const columns = sql.columns(["id", "name"]);
    const sqlArray = sql.array(ids as string[], "int4");
    const authors = await this.query(
      sql`SELECT ${columns} FROM authors WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
    );
    return ids.map(id => authors.find(p => p.id === id));
  });

  private getByIdEnhanchedLoader = enhancedDataLoader(
    async (ids: string[], columns: ListSqlTokenType) => {
      const sqlArray = sql.array(ids, "int4");
      const authors = await this.query(
        sql`SELECT ${columns} FROM authors WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      return ids.map(id => authors.find(p => p.id === id));
    },
  );
}

export default DataSource;

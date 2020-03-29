import { Author } from "./index";
import DataLoader from "dataloader";
import { enhancedDataLoader, SQLDataSource } from "src/lib/datasource";
import { sql, QueryResultRowType } from "src/postgres";
import { selectFields } from "src/lib/graphql";
import { AppContext } from "src/graph/types";
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
    const fields = this.selectFields(info);
    return this.getByIdEnhanchedLoader.load({
      id: authorId,
      selectedColumns: fields,
    });
  }

  idColumns = new Set(["id"]);

  columns = new Set(["id", "name"]);

  selectFields = selectFields(this.idColumns, this.columns);

  serialize = (author: Author): string =>
    JSON.stringify({
      id: author.id,
      title: author.name,
    });

  deserializeQueryResult = (
    rows: readonly QueryResultRowType<string>[],
  ): Author[] => {
    return rows.map(
      row => new Author(row["id"].toString(), row["name"] as string),
    );
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
    async (ids: string[], selectedColumns: ListSqlTokenType) => {
      const sqlArray = sql.array(ids, "int4");
      const authors = await this.query(
        sql`SELECT ${selectedColumns} FROM authors WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
      );
      return ids.map(id => authors.find(p => p.id === id));
    },
  );
}

export default DataSource;

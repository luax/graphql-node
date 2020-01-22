import { Author } from "./index";
import { client, sql, QueryResultRowType } from "../../postgres";
import DataLoader from "dataloader";
import SQLDataSource from "../datasources/SQLDataSource";

class DataSource extends SQLDataSource<Author> {
  async getById(authorId: string): Promise<Author | undefined> {
    return this.getByIdLoader.load(authorId);
  }

  deserializeQueryResult = (
    rows: readonly QueryResultRowType<string>[],
  ): Author[] => {
    return rows.map(row => ({
      id: row["id"].toString(),
      name: row["name"] as string,
    }));
  };

  private getByIdLoader = new DataLoader(async (ids: readonly string[]) => {
    const columns = client.columns(["id", "name"]);
    const sqlArray = sql.array(ids as string[], "int4");
    const authors = await this.query(
      sql`SELECT ${columns} FROM authors WHERE id = ANY (${sqlArray}) ORDER BY id ASC`,
    );
    return ids.map(id => authors.find(p => p.id === id));
  });
}

export default DataSource;

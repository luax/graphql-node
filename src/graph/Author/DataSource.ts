import { Author } from "./index";
import DataLoader from "dataloader";
import { SQLDataSource, QueryResultRowType, sql } from "../../lib";
import { AppContext } from "../types";

class DataSource extends SQLDataSource<AppContext, Author> {
  async getById(authorId: string): Promise<Author | undefined> {
    return this.getByIdLoader.load(authorId);
  }

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
}

export default DataSource;

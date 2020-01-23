import {
  SqlTaggedTemplateType,
  ListSqlTokenType,
  sql as originalSql,
} from "slonik";

interface Sql extends SqlTaggedTemplateType {
  columns: (columns: string[]) => ListSqlTokenType;
}

const sql = originalSql as Sql;
sql.columns = (columns: string[]): ListSqlTokenType => {
  return sql.join(
    columns.map(column => sql.identifier([column])),
    sql`, `,
  );
};
export default sql;

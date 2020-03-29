import DataLoader from "dataloader";
import { sql } from "src/postgres";
import { ListSqlTokenType } from "slonik";

interface IdAndColumns {
  id: string;
  selectedColumns: string[];
}

type BatchFunction<T> = (
  ids: string[],
  selectedColumns: ListSqlTokenType,
) => Promise<Array<T | undefined>>;

const idsAndColumns = <T>(fn: BatchFunction<T>) => async (
  keys: readonly IdAndColumns[],
): Promise<Array<T | undefined>> => {
  const ids = keys.map(key => key.id);
  const columnMatrix = keys.map(key => key.selectedColumns);
  const distinctColumns = [...new Set(columnMatrix.flat())];
  const columns = distinctColumns.sort();
  const sqlColumns = sql.columns(columns);
  const res = await fn(ids, sqlColumns);
  return res;
};

const enhancedDataLoader = <T>(
  batchFunction: BatchFunction<T>,
): DataLoader<IdAndColumns, T | undefined> => {
  const enhanced = idsAndColumns(batchFunction);
  return new DataLoader(enhanced, {
    cacheKeyFn: (key: IdAndColumns): string =>
      `${key.id}_${key.selectedColumns}`,
  });
};

export default enhancedDataLoader;

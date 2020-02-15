import DataLoader from "dataloader";
import { sql } from "../../postgres";
import { ListSqlTokenType } from "slonik";

interface IdAndColumns {
  id: string;
  columns: string[];
}

type BatchFunction<T> = (
  ids: string[],
  columns: ListSqlTokenType,
) => Promise<Array<T | undefined>>;

const idsAndColumns = <T>(fn: BatchFunction<T>) => async (
  keys: readonly IdAndColumns[],
): Promise<Array<T | undefined>> => {
  const ids = keys.map(key => key.id.toString());
  const columnMatrix = keys.map(key => key.columns);
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
    cacheKeyFn: (key: IdAndColumns): string => `${key.id}_${key.columns}`,
  });
};

export default enhancedDataLoader;

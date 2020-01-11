const DataLoader = require("dataloader");
const { client } = require("../postgres");

const idsAndColumns = fn => async keys => {
  const ids = keys.map(key => key.id.toString());
  const columnMatrix = keys.map(key => key.columns);
  const distinctColumns = [...new Set(columnMatrix.flat())];
  const columns = distinctColumns.sort();
  const sqlColumns = client.columns(columns);
  const res = await fn(ids, sqlColumns);
  return res;
};

const dataloader = batchFunction => {
  const enhanced = idsAndColumns(batchFunction);
  return new DataLoader(enhanced, {
    cacheKeyFn: key => `${key.id}_${key.columns}`,
  });
};

module.exports = {
  dataloader,
};

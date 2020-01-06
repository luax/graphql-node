const { createPool } = require("slonik");

let pool = {
  query: () => {
    throw new Error("call initialize first");
  },
};
let init = false;
module.exports = {
  query: async (query, params) => {
    const start = Date.now();
    const res = await pool.query(query, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log({
        query: {
          sql: query.sql,
          values: JSON.stringify(query.values),
        },
        duration,
        rows: res.rowCount,
      });
    }
    return res.rows;
  },
  initialize: () => {
    if (init) throw new Error("called initialize twice");
    init = true;
    pool = createPool(process.env.DATABASE_URL, {
      maximumPoolSize: 20,
      connectionTimeout: 2000,
    });
  },
  end: async () => pool.end(),
};

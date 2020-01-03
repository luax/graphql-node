const { Pool } = require("pg");

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
    if (process.env.NODE_ENV === "development")
      console.log({ query, params, duration, rows: res.rowCount });
    return res.rows;
  },
  initialize: () => {
    if (init) throw new Error("called initialize twice");
    init = true;
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 2000,
    });
  },
  end: async () => pool.end(),
};

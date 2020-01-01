const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  query: async (query, params) => {
    const start = Date.now();
    const res = await pool.query(query, params);
    const duration = Date.now() - start;
    console.log("executed query", { query, duration, rows: res.rowCount });
    return res.rows;
  },
};

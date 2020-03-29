/* eslint-disable no-process-env */
export const config = {
  APP_NAME: process.env.APP_NAME || "",
  NODE_ENV: process.env.NODE_ENV || "",
  IN_PRODUCTION: process.env.NODE_ENV === "production",
  IN_DEVELOPMENT: process.env.NODE_ENV === "development",
  IN_TESTING: process.env.NODE_ENV === "test",
  PORT: parseInt(process.env.PORT || "4000"),
  DATABASE_URL: process.env.DATABASE_URL || "",
  DATABASE_LOG_SQL: process.env.LOG_SQL === "true",
};

export const databaseSettings = {
  name: config.APP_NAME,
  databaseUrl: config.DATABASE_URL,
  logSql: config.DATABASE_LOG_SQL,
};
/* eslint-enable no-process-env */

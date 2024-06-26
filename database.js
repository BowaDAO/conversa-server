const { Pool } = require("pg");

const pool = new Pool({
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  password: process.env.DATABASE_PASSWORD,
  port: Number(process.env.DATABASE_PORT),
});

module.exports = pool;

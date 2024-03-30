// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: process.env.DATABASE_CLIENT || "postgresql",
    connection: {
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
    },
    migrations: {
      tableName: "migrations",
    },
  },

  staging: {
    client: process.env.DATABASE_CLIENT || "postgresql",
    connection: {
      database: process.env.STAGING_DATABASE_NAME,
      user: process.env.STAGING_DATABASE_USER,
      password: process.env.STAGING_DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "migrations",
    },
  },

  production: {
    client: process.env.DATABASE_CLIENT || "postgresql",
    connection: {
      database: process.env.PRODUCTION_DATABASE_NAME,
      user: process.env.PRODUCTION_DATABASE_USER,
      password: process.env.PRODUCTION_DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "migrations",
    },
  },
};

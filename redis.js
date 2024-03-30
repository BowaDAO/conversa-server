require("dotenv").config();
const { createClient } = require("redis");

const redisOptions = {
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    tls: true,
  },
};

let redisClient = createClient(
  process.env.NODE_ENV === "production" ? redisOptions : {}
).connect();

module.exports = redisClient;

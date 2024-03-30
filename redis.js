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

let redisClient = createClient({ url: process.env.REDIS_URL });

module.exports = redisClient;

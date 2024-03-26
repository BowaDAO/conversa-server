require("dotenv").config();
const { createClient } = require("redis");

let redisClient = createClient(process.env.REDIS_URL);

module.exports = redisClient;

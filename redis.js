require("dotenv").config();
const { createClient } = require("redis");

let redisClient = createClient({ url: process.env.REDIS_URL });

module.exports = redisClient;

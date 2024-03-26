// const Redis = require("ioredis");
const { createClient } = require("redis");

let redisClient = createClient();

module.exports = redisClient;

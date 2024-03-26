const redisClient = require("../redis");

const rateLimiter = (expire, requestLimit) => async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const response = await redisClient.multi().incr(ip).expire(ip, expire).exec();

  if (response[1] > requestLimit) {
    return res.json({
      loggedIn: false,
      message: "Too many attemps. Try again in a minute.",
    });
  }

  next();
};

module.exports = rateLimiter;

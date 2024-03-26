const RedisStore = require("connect-redis").default;
const session = require("express-session");
const redisClient = require("../redis");
require("dotenv").config();

let redisStore = new RedisStore({
  client: redisClient,
});

const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET,
  credentials: true,
  resave: false,
  name: "sid",
  saveUninitialized: false,
  store: redisStore,
  cookie: {
    secure: process.env.NODE_ENV === "production" ? "true" : "auto",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: 1000 * 60 * 60 * 24,
  },
});

const wrapper = (expressMiddleware) => (socket, next) =>
  expressMiddleware(socket.request, {}, next);

const corsOption = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
};

module.exports = { sessionMiddleware, wrapper, corsOption };

const express = require("express");
const app = express();
require("dotenv").config();
const { Server } = require("socket.io");
const { createServer } = require("node:http");
const helmet = require("helmet");
const cors = require("cors");
const authRouter = require("./routes/auth");
const { corsOption } = require("./controllers/server");
const redisClient = require("./redis");
const {
  dm,
  authorizeUser,
  initializeUser,
  addFriend,
  onDisconnect,
} = require("./controllers/socketio");

const server = createServer(app);

redisClient.on("error", (err) => console.log(err)).connect();

const io = new Server(server, {
  cors: corsOption,
});

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOption));
app.set("trust proxy", 1);
app.use("/auth", authRouter);
io.use(authorizeUser);

io.on("connection", (socket) => {
  initializeUser(socket);

  socket.on("add_friend", (friendName, cb) => {
    addFriend(socket, friendName, cb);
  });

  socket.on("dm", (message) => dm(socket, message));

  socket.on("disconnecting", () => onDisconnect(socket));
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is listening in port ${port}`);
});

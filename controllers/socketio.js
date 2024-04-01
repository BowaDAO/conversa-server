const redisClient = require("../redis");
const { jwtVerify } = require("../utilities/jwtAuth");

const authorizeUser = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (token)
    jwtVerify(token, process.env.JWT_SECRET)
      .then((decodedToken) => {
        socket.user = { ...decodedToken };
        next();
      })
      .catch((error) => {
        next(new Error("Not authorized"));
      });
};

const initializeUser = async (socket) => {
  socket.join(socket?.user.userid);

  await redisClient.hSet(
    `userid:${socket.user.username}`,
    "userid",
    socket.user.userid,
    "connected",
    "true"
  );

  const friendList = await redisClient.lRange(
    `friends:${socket.user.username}`,
    0,
    -1
  );

  const parsedFriendList = await parseFriendList(friendList);

  const friendRooms = parsedFriendList.map((friend) => friend.userid);

  if (friendRooms.length > 0) {
    socket.to(friendRooms).emit("connected", "true", socket.user.username);
  }

  socket.emit("friends", parsedFriendList);

  const messageQuery = await redisClient.lRange(
    `chat:${socket.user.userid}`,
    0,
    -1
  );

  const messages = messageQuery.map((messageString) => {
    const parsedString = messageString.split(".");
    return {
      to: parsedString[0],
      from: parsedString[1],
      content: parsedString[2],
    };
  });

  if (messages && messages.length > 0) {
    socket.emit("messages", messages);
  }
};

const addFriend = async (socket, friendName, cb) => {
  if (friendName === socket.user.username) {
    cb({ done: false, errorMsg: "Cannot add self!" });
    return;
  }

  const friend = await redisClient.hGetAll(`userid:${friendName}`);

  if (!friend.userid) {
    cb({ errorMsg: "user does not exists!", done: false });
    return;
  }

  const currentFriendList = await redisClient.lRange(
    `friends:${socket.user.username}`,
    0,
    -1
  );

  const currentFriendsUsernames = currentFriendList.map(
    (currentFriendList) => currentFriendList.split(".")[0]
  );

  if (currentFriendList && currentFriendsUsernames.indexOf(friendName) !== -1) {
    cb({ errorMsg: "Friend already added!", done: false });
    return;
  }

  await redisClient.lPush(
    `friends:${socket.user.username}`,
    [friendName, friend.userid].join(".")
  );

  await redisClient.lPush(
    `friends:${friendName}`,
    [socket.user.username, socket.user.userid].join(".")
  );

  const newFriend = {
    username: friendName,
    userid: friend.userid,
    connected: friend.connected,
  };

  cb({ done: true, newFriend });
};

const onDisconnect = async (socket) => {
  await redisClient.hSet(
    `userid:${socket.user.username}`,
    "connected",
    "false"
  );

  const friendList = await redisClient.lRange(
    `friends:${socket.user.username}`,
    0,
    -1
  );

  const parsedFriendList = await parseFriendList(friendList);

  const friendRooms = parsedFriendList.map((friend) => friend.userid);

  if (friendRooms.length > 0) {
    socket.to(friendRooms).emit("connected", "false", socket.user.username);
  }
};

const parseFriendList = async (friendList) => {
  const newFriendList = [];

  for (let friend of friendList) {
    const parsedFriend = friend.split(".");

    const friendConnection = await redisClient.hGet(
      `userid:${parsedFriend[0]}`,
      "connected"
    );

    newFriendList.push({
      username: parsedFriend[0],
      userid: parsedFriend[1],
      connected: friendConnection,
    });
  }

  return newFriendList;
};

const dm = async (socket, message) => {
  message.from = socket.user.userid;

  const messageString = [message.to, message.from, message.content].join(".");

  await redisClient.lPush(`chat:${message.to}`, messageString);

  await redisClient.lPush(`chat:${message.from}`, messageString);

  socket.to(message.to).emit("dm", message);
};

module.exports = { authorizeUser, initializeUser, addFriend, onDisconnect, dm };

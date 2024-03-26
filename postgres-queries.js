const userExistsQuery = "SELECT username from users WHERE username = $1";
const createNewUserQuery =
  "INSERT INTO users(username, hashedPassword, userid) VALUES($1, $2, $3) RETURNING id, username, userid";
const loginQuery =
  "SELECT id, username, userid, hashedPassword FROM users u WHERE u.username=$1";

module.exports = { userExistsQuery, createNewUserQuery, loginQuery };

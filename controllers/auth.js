const pool = require("../database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const {
  createNewUserQuery,
  userExistsQuery,
  loginQuery,
} = require("../postgres-queries");

const signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query(loginQuery, [username]);

    if (user.rowCount < 1) {
      return res.status(401).json({
        loggedIn: false,
        message: "Wrong username or password.",
      });
    }

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.rows[0].hashedpassword
    );

    if (!passwordIsCorrect) {
      return res
        .status(401)
        .json({ loggedIn: false, message: "Incorrect password." });
    }

    req.session.user = {
      username,
      userid: user.rows[0].userid,
    };

    return res.json({ loggedIn: true, username, userid: user.rows[0].userid });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Something went wrong, try again." });
  }
};

const signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await pool.query(userExistsQuery, [username]);

    if (userExists.rowCount < 1) {
      const hashedpassword = await bcrypt.hash(password, 10);

      const newUser = await pool.query(createNewUserQuery, [
        username,
        hashedpassword,
        uuidv4(),
      ]);

      req.session.user = {
        username,
        userid: newUser.rows[0].userid,
      };

      return res.json({
        loggedIn: true,
        username,
        userid: newUser.rows[0].userid,
      });
    } else {
      return res
        .status(409)
        .json({ loggedIn: false, message: "User already exists" });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Something went wrong, try again." });
  }
};

const handleSession = async (req, res) => {
  if (req.session.user && req.session.user.username) {
    return res.json({
      loggedIn: true,
      username: req.session.user.username,
      userid: req.session.user.userid,
    });
  } else {
    return res.json({ loggedIn: false });
  }
};

module.exports = { signin, signup, handleSession };

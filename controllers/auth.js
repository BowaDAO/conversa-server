const pool = require("../database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const {
  createNewUserQuery,
  userExistsQuery,
  loginQuery,
} = require("../postgres-queries");
const { jwtSign, jwtVerify } = require("../utilities/jwtAuth");

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

    jwtSign(
      {
        username: req.body.username,
        id: user.rows[0].id,
        userid: user.rows[0].userid,
      },

      process.env.JWT_SECRET,

      { expiresIn: "2d" }
    ).then((token) => {
      res.json({ loggedIn: true, token });
    });
  } catch (error) {
    return res
      .status(400)
      .json({ loggedIn: false, message: "Something went wrong, try again." });
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

      jwtSign(
        {
          username: req.body.username,
          id: newUser.rows[0].id,
          userid: newUser.rows[0].userid,
        },

        process.env.JWT_SECRET,

        { expiresIn: "2d" }
      )
        .then((token) => {
          res.json({ loggedIn: true, token });
        })
        .catch((error) => {
          res.json({ loggedIn: false, token });
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
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.json({ loggedIn: false });
  }

  jwtVerify(token, process.env.JWT_SECRET)
    .then((decodedToken) => {
      res.json({ loggedIn: true, decodedToken });
    })
    .catch((error) => {
      res.json({ loggedIn: false });
    });
};

module.exports = { signin, signup, handleSession };

const jwt = require("jsonwebtoken");

const jwtSign = (payload, secret, options) =>
  new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (error, token) => {
      if (error) reject(error);
      resolve(token);
    });
  });

const jwtVerify = (token, secret) =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error, decodedToken) => {
      if (error) reject(error);
      resolve(decodedToken);
    });
  });

module.exports = { jwtSign, jwtVerify };

/*
  authMiddleware.js
  -----------------
  Express middleware for authenticating requests using JWT tokens.
  Verifies the token from the Authorization header and attaches the decoded user info to req.user.
  Returns 401 or 403 errors for missing, invalid, or expired tokens.
*/

const jwt = require("jsonwebtoken");
const config = require("../config");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, config.jwtPrivateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};

module.exports = authMiddleware;

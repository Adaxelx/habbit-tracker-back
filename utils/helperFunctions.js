const { User } = require("../models");
const jwt = require("jsonwebtoken");

const token = process.env.TOKEN_SECRET;
const authorizeUser = async (token, userId) => {
  try {
    const res = await User.find({ token, _id: userId });
    if (res.length === 1) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const checkIfUserExist = async (res, authorization) => {
  if (!authorization) {
    res.status(401);
    res.json({ message: "Missing creditials." });
    return;
  }

  const [token, userId] = authorization.split(":");

  const isAuthorized = await authorizeUser(token, userId);

  if (!isAuthorized) {
    res.status(401);
    res.json({ message: "User doesn't exist." });
    return;
  }
  return userId;
};

const returnKeyIfExist = (key, value) => (key ? { [key]: value } : null);

function generateAccessToken(username) {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, {
    expiresIn: "7d",
  });
} // 14 days

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(":")[0];

  if (token == null) next();

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403);
      return res.json({ message: "Missing creditials." });
    }

    next();
  });
}

module.exports = {
  authorizeUser,
  checkIfUserExist,
  returnKeyIfExist,
  generateAccessToken,
  authenticateToken,
};

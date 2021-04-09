const { User } = require("../models");

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

module.exports = { authorizeUser, checkIfUserExist, returnKeyIfExist };

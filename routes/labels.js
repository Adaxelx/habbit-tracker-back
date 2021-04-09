var express = require("express");
var router = express.Router();
const { Label, User } = require("../models");

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

const returnKeyIfExist = (key, value) => (key ? { [key]: value } : null);
const isLabelInDb = async (label, id) => {
  const result = await Label.find(label).where("_id").ne(id);

  return result.length;
};

/* GET home page. */
router.get("/all/", async (req, res) => {
  const { authorization } = req.headers;

  const [token, userId] = authorization.split(":");

  const isAuthorized = await authorizeUser(token, userId);

  if (!isAuthorized) {
    res.status(401);
    res.json({ message: "User doesn't exist." });
    return;
  }

  try {
    const response = await Label.find({ userId });
    res.status(200);
    res.json({ count: response.length, labels: response });
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.post("/add/", async (req, res) => {
  const { title } = req.body;

  const { authorization } = req.headers;

  const [token, userId] = authorization.split(":");

  const isAuthorized = await authorizeUser(token, userId);

  if (!isAuthorized) {
    res.status(401);
    res.json({ message: "User doesn't exist." });
    return;
  }

  const resLabel = await Label.find({ title, userId });

  if (resLabel.length === 0) {
    try {
      const resCreate = await Label.create({ ...req.body, userId });
      res.status(201);
      res.end();
    } catch (err) {
      res.status(500);
      res.json({ message: "Database is not responding. Try again later." });
    }
  } else {
    res.status(400);
    res.json({ message: "This label exist in database." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, color } = req.body;

  const { authorization } = req.headers;

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

  let editedObject = { ...returnKeyIfExist("color", color) };
  if (title) {
    if (await isLabelInDb({ title, userId }, id)) {
      res.status(400);
      res.json({ message: "This label exist in database." });
      return;
    }
    editedObject.title = title;
  }

  const resLabel = await Label.find({ _id: id, userId });

  if (resLabel.length === 1) {
    try {
      const resCreate = await Label.updateOne({ _id: id }, { ...editedObject });
      res.status(200);
      res.end();
    } catch (err) {
      res.status(500);
      res.json({ message: "Database is not responding. Try again later." });
    }
  } else {
    res.status(400);
    res.json({ message: "You don't have label with this name." });
  }
});

module.exports = router;

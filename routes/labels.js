var express = require("express");
var router = express.Router();
const { Label } = require("../models");
const {
  checkIfUserExist,
  returnKeyIfExist,
} = require("../utils/helperFunctions");

const isLabelInDb = async (label, id) => {
  const result = await Label.find(label).where("_id").ne(id);

  return result.length;
};

/* GET home page. */
router.get("/", async (req, res) => {
  const { authorization } = req.headers;

  const userId = await checkIfUserExist(res, authorization);

  try {
    const response = await Label.find({ userId });
    res.status(200);
    res.json(response);
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.post("/", async (req, res) => {
  const { title } = req.body;
  const { authorization } = req.headers;
  const userId = await checkIfUserExist(res, authorization);

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

  const userId = await checkIfUserExist(res, authorization);

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
      const resEdit = await Label.updateOne({ _id: id }, { ...editedObject });
      console.log(resEdit);
      if (resEdit?.n === 1) {
        res.status(200);
        res.json({ message: "Correctly edited." });
      } else {
        res.status(500);
        res.json({ message: "Something went wrong." });
      }
    } catch (err) {
      res.status(500);
      res.json({ message: "Database is not responding. Try again later." });
    }
  } else {
    res.status(404);
    res.json({ message: "You don't have label with this name." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { authorization } = req.headers;
  const userId = await checkIfUserExist(res, authorization);

  const resLabel = await Label.find({ _id: id, userId });

  if (resLabel.length === 1) {
    try {
      const resDelete = await Label.deleteOne({ _id: id, userId });
      if (resDelete?.n === 1) {
        res.status(204);
        res.end();
      } else {
        res.status(500);
        res.json({ message: "Something went wronng." });
      }
    } catch (err) {
      res.status(500);
      res.json({ message: "Database is not responding. Try again later." });
    }
  } else {
    res.status(404);
    res.json({ message: "You don't have label with this name." });
  }
});

module.exports = router;

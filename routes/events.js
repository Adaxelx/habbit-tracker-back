var express = require("express");
var router = express.Router();
const { Event, Label } = require("../models");
const ObjectID = require("mongodb").ObjectID;
const {
  checkIfUserExist,
  returnKeyIfExist,
} = require("../utils/helperFunctions");

router.post("/", async (req, res) => {
  const { label } = req.body;
  const { authorization } = req.headers;
  const userId = await checkIfUserExist(res, authorization);
  const resLabel = await Label.find({ _id: ObjectID(label) });

  if (resLabel.length === 0) {
    res.status(404);
    res.json({ message: "Label with this id doesn't exist." });
    return;
  }

  try {
    const resCreate = await Event.create({ ...req.body, userId });
    res.status(201);
    res.end();
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.patch("/check/:id", async (req, res) => {
  const { day, month, year } = req.body;
  const { authorization } = req.headers;
  const { id } = req.params;
  const userId = await checkIfUserExist(res, authorization);
  const resEvent = await Event.find({ _id: ObjectID(id) });

  if (resEvent.length === 0) {
    res.status(404);
    res.json({ message: "Event with this id doesn't exist." });
    return;
  }

  let checked = [...resEvent[0].checked];
  const index = checked.findIndex(
    (event) => event.day === day && event.month === month && event.year === year
  );
  if (index !== -1) {
    checked.splice(index, 1);
  } else {
    checked = [...checked, { day, month, year }];
  }

  try {
    const resCreate = await Event.updateOne({
      checked,
    });
    res.status(200);
    res.json({ message: "Pomyślnie zmieniono stan." });
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

module.exports = router;

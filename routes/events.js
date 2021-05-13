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
    await Event.create({ ...req.body, userId });
    res.status(201);
    res.end();
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.patch("/:id", async (req, res) => {
  const { label } = req.body;
  const { id } = req.params;
  const { authorization } = req.headers;
  const userId = await checkIfUserExist(res, authorization);
  if (label) {
    const resLabel = await Label.find({ _id: ObjectID(label) });

    if (resLabel.length === 0) {
      res.status(404);
      res.json({ message: "Label with this id doesn't exist." });
      return;
    }
  }

  try {
    await Event.findOneAndUpdate({ userId, _id: id }, { ...req.body });
    res.status(201);
    res.end();
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.get("/", async (req, res) => {
  const { from, to, exclude } = req.query;
  const { authorization } = req.headers;

  const userId = await checkIfUserExist(res, authorization);

  try {
    const resGet = await Event.find({
      userId,
      dateStart: { $gte: new Date(from), $lte: new Date(to) },
      dateEnd: { $gte: new Date(to) },
      // label: { $nin: exclude },
    });

    const resLabelGet = await Label.find({ userId });

    const response = resGet.map((event) => {
      const label = resLabelGet.filter(
        (label) => label._id.toString() === event.label
      )[0];

      event.label = label;
      return event;
    });

    res.status(200);
    res.json(response);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.get("/:date", async (req, res) => {
  const { date } = req.params;
  const { authorization } = req.headers;

  const userId = await checkIfUserExist(res, authorization);
  let day = new Date(date).getDay() - 1;
  if (day === -1) {
    day = 6;
  }
  try {
    const resGet = await Event.find({
      userId,
      daysOfWeek: day,
      dateStart: { $lte: new Date(date) },
      dateEnd: { $gte: new Date(date) },
    });

    const resLabelGet = await Label.find({ userId });

    const response = resGet.map((event) => {
      const label = resLabelGet.filter(
        (label) => label._id.toString() === event.label
      )[0];

      event.label = label;
      return event;
    });

    res.status(200);
    res.json(response);
  } catch (err) {
    console.log(err);
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

  if (!resEvent[0].daysOfWeek.includes(new Date(year, month, day).getDay())) {
    res.status(400);
    res.json({ message: "Wrong week day. Check if you passed correct day." });
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
    await Event.updateOne({
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

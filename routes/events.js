var express = require("express");
var router = express.Router();
const { Event, Label } = require("../models");
const ObjectID = require("mongodb").ObjectID;
const {
  checkIfUserExist,
  returnKeyIfExist,
  authenticateToken,
} = require("../utils/helperFunctions");

router.post("/", authenticateToken, async (req, res) => {
  const { label } = req.body;
  const { authorization } = req.headers;
  const userId = authorization.split(":")[1];
  // const userId = await checkIfUserExist(res, authorization);
  if (label) {
    const resLabel = await Label.find({ _id: ObjectID(label) });
    if (resLabel.length === 0) {
      res.status(404);
      res.json({ message: "Label with this id doesn't exist." });
      return;
    }
  } else {
    req.body.label = undefined;
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

router.put("/:id", authenticateToken, async (req, res) => {
  const { label } = req.body;
  const { id } = req.params;
  const { authorization } = req.headers;
  const userId = authorization.split(":")[1];
  if (label) {
    const resLabel = await Label.find({ _id: ObjectID(label) });
    if (resLabel.length === 0) {
      res.status(404);
      res.json({ message: "Label with this id doesn't exist." });
      return;
    }
  } else {
    req.body.label = undefined;
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

router.get("/", authenticateToken, async (req, res) => {
  const { from, to, exclude } = req.query;
  const { authorization } = req.headers;
  const userId = authorization.split(":")[1];

  try {
    const resGet = await Event.find({
      userId,
      dateStart: { $lte: new Date(to) },
      dateEnd: { $gte: new Date(from) },
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

router.get("/:date", authenticateToken, async (req, res) => {
  const { date } = req.params;
  const { authorization } = req.headers;
  const userId = authorization.split(":")[1];
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

router.patch("/check/:id", authenticateToken, async (req, res) => {
  const [year, month, day] = req.body;
  const { authorization } = req.headers;
  const userId = authorization.split(":")[1];
  const { id } = req.params;

  const resEvent = await Event.find({ _id: ObjectID(id) });

  if (resEvent.length === 0) {
    res.status(404);
    res.json({ message: "Event with this id doesn't exist." });
    return;
  }
  const date = new Date(year, month, day);

  let dayCalc = date.getDay();
  if (dayCalc === 0) {
    dayCalc = 7;
  }
  dayCalc -= 1;
  if (!resEvent[0].daysOfWeek.includes(dayCalc)) {
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
    await Event.updateOne(
      { userId, _id: id },
      {
        checked,
      }
    );
    res.status(200);
    res.json({ message: "Pomyślnie zmieniono stan." });
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { authorization } = req.headers;
  const userId = authorization.split(":")[1];

  const resLabel = await Event.find({ _id: id, userId });

  if (resLabel.length === 1) {
    try {
      const resDelete = await Event.deleteOne({ _id: id, userId });
      if (resDelete?.n === 1) {
        res.status(204);
        res.end();
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

module.exports = router;

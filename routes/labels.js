var express = require("express");
var router = express.Router();
const { Label } = require("../models");

/* GET home page. */
router.get("/all/", async (req, res) => {
  try {
    const response = await Label.find({});
    res.status(200);
    res.json({ count: response.length, labels: response });
  } catch (err) {
    res.status(500);
    res.json({ message: "Database is not responding. Try again later." });
  }
});

router.post("/add/", async (req, res) => {
  const { title } = req.body;

  const resLabel = await Label.find({ title });

  if (resLabel.length === 0) {
    try {
      const resCreate = await Label.create({ ...req.body });
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

module.exports = router;

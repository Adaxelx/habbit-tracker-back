var express = require("express");
const crypto = require("crypto");
var router = express.Router();
const { User } = require("../models");

const BYTES = 48;

/* GET users listing. */
router.post("/login", async (req, res) => {
  try {
    const users = await User.find(req.body);
    if (users.length === 1) {
      const { _id } = users[0];
      const token = crypto.randomBytes(BYTES).toString("hex");
      const updatedToken = await User.updateOne({ _id }, { token });
      if (updatedToken.nModified) {
        res.status(200);
        res.json({ token });
      } else {
        res.status(500);
        res.json({ message: "Something went wrong." });
      }
    }
  } catch (err) {
    res.status(404);
    res.json({ message: "User not found" });
  }
});

router.post("/logout", async (req, res) => {
  const { authorization } = req.headers;
  try {
    const users = await User.find({ token: authorization });
    if (users.length === 1) {
      const { _id } = users[0];
      const updatedToken = await User.updateOne({ _id }, { token: "" });
      if (updatedToken.nModified) {
        res.status(200);
        res.json({ message: "Successfuly logedout." });
      } else {
        res.status(500);
        res.json({ message: "Something went wrong." });
      }
    }
  } catch (err) {
    res.status(404);
    res.json({ message: "User not found" });
  }
});

router.post("/register", async (req, res) => {
  const { login, email } = req.body;

  const resLogin = await User.find({ login });
  const resEmail = await User.find({ email });

  if (resLogin.length === 0 && resEmail.length === 0) {
    try {
      const token = crypto.randomBytes(BYTES).toString("hex");
      const resCreate = await User.create({ ...req.body, token });

      res.status(200);
      res.json({ token });
    } catch (err) {
      res.status(500);
      res.json({ message: "Database is not responding. Try again later." });
    }
  } else {
    res.status(400);
    res.json({ message: "This user exist in database." });
  }
});

module.exports = router;

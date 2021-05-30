var express = require("express");
const crypto = require("crypto");
var router = express.Router();
const { User } = require("../models");
const { checkIfUserExist } = require("../utils/helperFunctions");

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
        res.json({ token: `${token}:${users[0]._id}` });
      } else {
        res.status(500);
        res.json({ message: "Something went wrong." });
      }
    } else {
      res.status(404);
      res.json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(404);
    res.json({ message: "User not found" });
  }
});

router.post("/logout", async (req, res) => {
  const { authorization } = req.headers;
  try {
    const userId = await checkIfUserExist(res, authorization);
    if (userId) {
      const updatedToken = await User.updateOne({ _id: userId }, { token: "" });
      if (updatedToken.nModified) {
        res.status(200);
        res.json({ message: "Successfuly logedout." });
      } else {
        res.status(500);
        res.json({ message: "Something went wrong." });
      }
    } else {
      res.status(404);
      res.json({ message: "User not found" });
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

  let message = [];

  if (resLogin.length === 1) {
    message.push("This login exist in database.");
  }
  if (resEmail.length === 1) {
    message.push("This email exist in database.");
  }
  if (message.length !== 0) {
    res.status(400);
    res.json({ message });
  } else {
    try {
      const token = crypto.randomBytes(BYTES).toString("hex");
      const resCreate = await User.create({ ...req.body, token });

      res.status(200);
      res.json({ token: `${token}:${resCreate._id}` });
    } catch (err) {
      res.status(500);
      res.json({ message: "Database is not responding. Try again later." });
    }
  }
});

module.exports = router;

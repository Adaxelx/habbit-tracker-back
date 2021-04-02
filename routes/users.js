var express = require("express");
var router = express.Router();
const { User } = require("../models");

/* GET users listing. */
router.post("/login", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/logout", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/register", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;

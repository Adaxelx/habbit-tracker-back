var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.DB, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var labelsRouter = require("./routes/labels");
var eventsRouter = require("./routes/events");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/label", labelsRouter);
app.use("/event", eventsRouter);
module.exports = app;

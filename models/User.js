var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
  login: String,
  password: String,
  email: String,
});

module.exports = mongoose.model("user", userSchema);
